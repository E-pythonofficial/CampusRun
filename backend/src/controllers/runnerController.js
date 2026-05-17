import prisma from '../lib/prisma.js';
// import { runAiVerification }            from '../services/ai.service.js';
import { sendApplicationReceivedEmail } from '../services/email.service.js';
import { emitToAdmin, emitToAll, emitToRequester } from '../services/socket.service.js';
import jwt from 'jsonwebtoken';

import { createTransferRecipient } from './payoutController.js';


// ── Submit runner application ──────────────────────────────────────────────────
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      reasonToJoin, matricNumber, department,
      college, hostel, idCardUrl, selfieUrl,
    } = req.body;

    if (!reasonToJoin || !idCardUrl || !selfieUrl) {
      return res.status(400).json({
        message: 'Reason, ID card, and selfie are required.',
      });
    }

    const existing = await prisma.user.findUnique({
      where:  { id: userId },
      select: { applicationStatus: true },
    });

    if (
      existing?.applicationStatus !== 'NOT_APPLIED' &&
      existing?.applicationStatus !== 'REJECTED' &&
      existing?.applicationStatus !== 'REJECTED_POST_INTERVIEW'
    ) {
      return res.status(409).json({
        message:           'You already have an active or pending application.',
        applicationStatus: existing.applicationStatus,
      });
    }

    // AI verification disabled — flagged for manual admin review
    const aiResult = { idCardIsReal: null, faceMatchScore: null, flagged: true };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role:                   'DISPATCHER',
        reasonToJoin,
        matricNumber:           matricNumber || null,
        department:             department   || null,
        college:                college      || null,
        hostel:                 hostel       || null,
        idCardUrl,
        selfieUrl,
        applicationStatus:      'PENDING_REVIEW',
        applicationSubmittedAt: new Date(),
        aiIdCardReal:           aiResult.idCardIsReal,
        aiFaceMatchScore:       aiResult.faceMatchScore,
        aiVerificationFlag:     aiResult.flagged,
      },
      select: {
        id: true, fullName: true, email: true,
        matricNumber: true, department: true, college: true,
        reasonToJoin: true, idCardUrl: true, selfieUrl: true,
        aiIdCardReal: true, aiFaceMatchScore: true, aiVerificationFlag: true,
        applicationSubmittedAt: true,
      },
    });

    // Fire and forget — don't await these, they slow down the response
    emitToAdmin('admin:new_application', updatedUser);
    sendApplicationReceivedEmail(updatedUser.email, updatedUser.fullName)
    .catch(err => console.error('Application email failed:', err.message));

    return res.status(200).json({
      message:           'Application submitted. Check your email for next steps.',
      applicationStatus: 'PENDING_REVIEW',
    });
  } catch (error) {
    console.error('submitApplication error:', error);
    return res.status(500).json({ message: 'Internal server error during application.' });
  }
};

// ── Get runner dashboard data ──────────────────────────────────────────────────
export const getDispatcherDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, availableRuns, activeRun] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: {
          applicationStatus: true,
          isApproved:        true,
          weeklyBalance:     true,
          totalEarned:       true,
        },
      }),
      prisma.delivery.findMany({
        where:   { status: 'PAID', runnerId: null },
        orderBy: { createdAt: 'desc' },
        include: { requester: { select: { fullName: true } } },
      }),
      prisma.delivery.findFirst({
        where: {
          runnerId: userId,
          status:   { in: ['ACCEPTED', 'PICKED_UP'] },
        },
        include: { requester: { select: { fullName: true, hostel: true } } },
      }),
    ]);

    return res.json({
      profile: {
        ...user,
        weeklyBalance: Number(user?.weeklyBalance ?? 0),
        totalEarned:   Number(user?.totalEarned   ?? 0),
      },
      availableRuns,
      activeRun,
    });
  } catch (error) {
    console.error('getDispatcherDashboard error:', error);
    return res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

export const locationUnload = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(200).json({ ok: true }); // silently ignore

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(200).json({ ok: true }); // silently ignore bad tokens
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data:  { isOnline: false },
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(200).json({ ok: true }); // always 200 for beacon
  }
};

// ── Accept an order ────────────────────────────────────────────────────────────
export const acceptOrder = async (req, res) => {
  try {
    const orderId  = req.params.id || req.params.orderId;
    const runnerId = req.user.id;

    const runner = await prisma.user.findUnique({ where: { id: runnerId } });
    if (!runner?.isApproved) return res.status(403).json({ message: 'Your account is not approved.' });
    if (runner?.isSuspended) return res.status(403).json({ message: 'Your account is currently suspended.' });

    const order = await prisma.delivery.findUnique({ where: { id: orderId } });
    if (!order)                  return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'PAID') return res.status(400).json({ message: 'This order is no longer available' });
    if (order.runnerId)          return res.status(400).json({ message: 'Order already taken by another runner' });

    const updated = await prisma.delivery.update({
      where: { id: orderId },
      data:  { status: 'ACCEPTED', runnerId },
    });

    return res.status(200).json({ message: 'Order accepted!', order: updated });
  } catch (error) {
    console.error('acceptOrder error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const acceptRun = acceptOrder;

// ── Mark order as picked up ────────────────────────────────────────────────────
export const markPickedUp = async (req, res) => {
  try {
    const orderId  = req.params.id || req.params.orderId;
    const runnerId = req.user.id;

    const order = await prisma.delivery.findUnique({ where: { id: orderId } });
    if (!order)                      return res.status(404).json({ message: 'Order not found' });
    if (order.runnerId !== runnerId) return res.status(403).json({ message: 'Not your order' });
    if (order.status !== 'ACCEPTED') return res.status(400).json({ message: 'Order must be ACCEPTED first' });

    const updated = await prisma.delivery.update({
      where: { id: orderId },
      data:  { status: 'PICKED_UP' },
    });

    return res.status(200).json({ message: 'Marked as picked up', order: updated });
  } catch (error) {
    console.error('markPickedUp error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Complete run — confirm delivery with handshake PIN ─────────────────────────
export const completeRun = async (req, res) => {
  try {
    const orderId  = req.params.id || req.params.orderId;
    const { pin }  = req.body;
    const runnerId = req.user.id;

    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    const order = await prisma.delivery.findUnique({ where: { id: orderId } });
    if (!order)                      return res.status(404).json({ message: 'Order not found' });
    if (order.runnerId !== runnerId) return res.status(403).json({ message: 'Not your order' });

    if (!['ACCEPTED', 'PICKED_UP'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot deliver order in status: ${order.status}` });
    }

    if (order.handshakePin !== pin.toString().trim()) {
      return res.status(401).json({ message: 'Incorrect PIN. Ask the requester to show their screen.' });
    }

    const [updated] = await prisma.$transaction([
      prisma.delivery.update({
        where: { id: orderId },
        data:  { status: 'DELIVERED', deliveredAt: new Date() },
      }),
      prisma.user.update({
        where: { id: runnerId },
        data: {
          weeklyBalance: { increment: order.runnerGets },
          totalEarned:   { increment: order.runnerGets },
        },
      }),
    ]);

    emitToRequester(order.requesterId, 'order:delivered', {
      orderId: orderId,
      message: 'Your item has been delivered!',
    });

    return res.status(200).json({
      message:  'Delivery confirmed! Earnings credited.',
      order:    updated,
      credited: Number(order.runnerGets),
    });
  } catch (error) {
    console.error('completeRun error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const confirmDeliveryPin = completeRun;

// ── Get runner's current active run ───────────────────────────────────────────
export const getActiveRun = async (req, res) => {
  try {
    const runnerId = req.user.id;
    const active   = await prisma.delivery.findFirst({
      where:   { runnerId, status: { in: ['ACCEPTED', 'PICKED_UP'] } },
      include: { requester: { select: { fullName: true, hostel: true } } },
    });
    return res.status(200).json(active ?? null);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get runner's run history ───────────────────────────────────────────────────
export const getRunHistory = async (req, res) => {
  try {
    const runnerId = req.user.id;
    const runs     = await prisma.delivery.findMany({
      where:   { runnerId, status: { in: ['DELIVERED', 'COMPLETED', 'CANCELLED'] } },
      include: { requester: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take:    50,
    });
    return res.status(200).json(runs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get earnings summary ───────────────────────────────────────────────────────
export const getMyEarnings = async (req, res) => {
  try {
    const runnerId = req.user.id;
    const runner   = await prisma.user.findUnique({
      where:  { id: runnerId },
      select: { weeklyBalance: true, totalEarned: true },
    });
    if (!runner) return res.status(404).json({ message: 'Runner not found' });

    const completedCount = await prisma.delivery.count({
      where: { runnerId, status: { in: ['DELIVERED', 'COMPLETED'] } },
    });

    return res.status(200).json({
      weeklyBalance: Number(runner.weeklyBalance),
      totalEarned:   Number(runner.totalEarned),
      completedRuns: completedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRunnerEarnings = getMyEarnings;

// ── Get application / runner status ───────────────────────────────────────────
export const getRunnerStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        applicationStatus:    true,
        interviewLink:        true,
        interviewScheduledAt: true,
        isApproved:           true,
        isSuspended:          true,
        suspendedUntil:       true,
        suspensionReason:     true,
        weeklyBalance:        true,
        totalEarned:          true,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      ...user,
      weeklyBalance: Number(user.weeklyBalance),
      totalEarned:   Number(user.totalEarned),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Save bank details ──────────────────────────────────────────────────────────
export const saveBankDetails = async (req, res) => {
  try {
    const { bankName, bankCode, accountNumber, accountName } = req.body;
    const runnerId = req.user.id;

    if (!bankName || !bankCode || !accountNumber || !accountName) {
      return res.status(400).json({ message: 'All bank fields are required' });
    }

    // Create Paystack recipient so withdrawals work later
    let paystackRecipientCode = null;
    try {
      paystackRecipientCode = await createTransferRecipient(
        accountNumber, bankCode, accountName
      );
    } catch (err) {
      console.error('Paystack recipient creation failed:', err.message);
      // Don't block saving — admin can fix manually
    }

    await prisma.user.update({
      where: { id: runnerId },
      data: {
        bankName,
        bankCode,
        accountNumber,
        accountName,
        bankDetailsSubmitted:  true,
        paystackRecipientCode, // ← saves the RCP_xxx code
      },
    });

    return res.status(200).json({ message: 'Bank details saved successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get nearby online runners ──────────────────────────────────────────────────
// Route: GET /api/runner/nearby?lat=x&lng=y
// Returns approved runners who are currently online with a known location
export const getNearbyRunners = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query params are required' });
    }

    const runners = await prisma.user.findMany({
      where: {
        role:       'DISPATCHER',
        isApproved: true,
        isOnline:   true,
      },
      select: {
        id:       true,
        fullName: true,
        lastLat:  true,
        lastLng:  true,
      },
    });

    const result = runners
      .filter(r => r.lastLat !== null && r.lastLng !== null)
      .map(r => ({
        id:   r.id,
        name: r.fullName,
        lat:  Number(r.lastLat),
        lng:  Number(r.lastLng),
      }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('getNearbyRunners error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Update runner's live location + online status ──────────────────────────────
// Route: POST /api/runner/location
// Called by the runner app when they toggle online/offline or move
export const updateRunnerLocation = async (req, res) => {
  try {
    const { lat, lng, isOnline } = req.body;
    const runnerId = req.user.id;

    await prisma.user.update({
      where: { id: runnerId },
      data: {
        lastLat:  lat      ?? undefined,
        lastLng:  lng      ?? undefined,
        isOnline: isOnline ?? undefined,
      },
    });

    return res.status(200).json({ message: 'Location updated' });
  } catch (error) {
    console.error('updateRunnerLocation error:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ── Get dispatcher deliveries ──────────────────────────────────────────────────
export const getDispatcherDeliveries = async (req, res) => {
  try {
    const runnerId = req.user.id;
    const deliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          { runnerId },
          { status: 'PAID', runnerId: null },
        ],
      },
      include: { requester: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = deliveries.map(d => ({
  id:              d.id,
  status:          d.status,
  itemDescription: d.item,           // ← was d.itemDescription
  pickupLocation:  d.pickupAddress,
  dropoffLocation: d.dropoffAddress,
  fee:             Number(d.totalPrice  ?? 0),  // ← was d.userPays
  runnerGets:      Number(d.runnerGets  ?? 0),
  pin:             d.handshakePin,
  requesterName:   d.requester?.fullName ?? 'Unknown',
  rating:          null,              // ← no rating field yet
  createdAt:       d.createdAt,
}));

    return res.json(mapped);
  } catch (error) {
    console.error('getDispatcherDeliveries error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get dispatcher stats ───────────────────────────────────────────────────────
export const getDispatcherStats = async (req, res) => {
  try {
    const runnerId = req.user.id;

    const [user, completed, accepted, cancelled] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: runnerId },
        select: { totalEarned: true, weeklyBalance: true },
      }),
      prisma.delivery.count({
        where: { runnerId, status: { in: ['DELIVERED', 'COMPLETED'] } },
      }),
      prisma.delivery.count({ where: { runnerId } }),
      prisma.delivery.count({ where: { runnerId, status: 'CANCELLED' } }),
    ]);

    const reliability = accepted > 0
      ? Math.round(((accepted - cancelled) / accepted) * 100)
      : 100;

    return res.json({
      completed,
      totalAccepted: accepted,
      totalEarnings: Number(user?.totalEarned  ?? 0),
      weeklyBalance: Number(user?.weeklyBalance ?? 0),
      averageRating: 5.0,   // ← static until you add rating to schema
      reliability,
    });
  } catch (error) {
    console.error('getDispatcherStats error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get leaderboard ────────────────────────────────────────────────────────────
export const getDispatcherLeaderboard = async (req, res) => {
  try {
    const dispatchers = await prisma.user.findMany({
      where:   { role: 'DISPATCHER', isApproved: true },
      select:  { id: true, fullName: true, totalEarned: true },
      orderBy: { totalEarned: 'desc' },
      take:    10,
    });

    const withStats = await Promise.all(dispatchers.map(async (d, i) => {
      const [completed, accepted, cancelled] = await Promise.all([
        prisma.delivery.count({
          where: { runnerId: d.id, status: { in: ['DELIVERED', 'COMPLETED'] } },
        }),
        prisma.delivery.count({ where: { runnerId: d.id } }),
        prisma.delivery.count({ where: { runnerId: d.id, status: 'CANCELLED' } }),
      ]);

      const reliability = accepted > 0
        ? Math.round(((accepted - cancelled) / accepted) * 100)
        : 100;

      return {
        rank:         i + 1,
        dispatcherId: d.id,
        name:         d.fullName,
        completed,
        reliability,
        rating:       5.0, // ← static until you add rating to schema
      };
    }));

    return res.json(withStats);
  } catch (error) {
    console.error('getDispatcherLeaderboard error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get dispatcher earnings breakdown ─────────────────────────────────────────
export const getDispatcherEarnings = async (req, res) => {
  try {
    const runnerId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const deliveries = await prisma.delivery.findMany({
      where: {
        runnerId,
        status:    { in: ['DELIVERED', 'COMPLETED'] },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { runnerGets: true, createdAt: true },
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyMap = {};
    days.forEach(d => { dailyMap[d] = { amount: 0, runs: 0 }; });

    deliveries.forEach(d => {
      const dow     = new Date(d.createdAt).getDay();
      const dayName = days[dow === 0 ? 6 : dow - 1];
      dailyMap[dayName].amount += Number(d.runnerGets ?? 0);
      dailyMap[dayName].runs   += 1;
    });

    const dailyEarnings = days.map(day => ({
      day,
      amount: dailyMap[day].amount,
      runs:   dailyMap[day].runs,
    }));

    let daysSincePayout = 0;
    try {
      const lastPayout = await prisma.payout.findFirst({
        where:   { runnerId },
        orderBy: { createdAt: 'desc' },
      });
      if (lastPayout) {
        daysSincePayout = Math.floor(
          (Date.now() - new Date(lastPayout.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    } catch {
      // Payout model doesn't exist yet — fine
    }

    return res.json({ dailyEarnings, daysSincePayout });
  } catch (error) {
    console.error('getDispatcherEarnings error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Notification preferences ───────────────────────────────────────────────────
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { notifDeliveryRequests: true, notifPayoutAlerts: true },
    });
    return res.json({
      deliveryRequests: user?.notifDeliveryRequests ?? false,
      payoutAlerts:     user?.notifPayoutAlerts     ?? false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const saveNotificationPreferences = async (req, res) => {
  try {
    const { deliveryRequests, payoutAlerts } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        notifDeliveryRequests: deliveryRequests ?? false,
        notifPayoutAlerts:     payoutAlerts     ?? false,
      },
    });
    return res.json({ message: 'Preferences saved' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Payment method ─────────────────────────────────────────────────────────────
export const getPaymentMethod = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { bankName: true, accountNumber: true, accountName: true },
    });

    if (!user?.bankName) {
      return res.status(200).json(null); // ← 200 not 404
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ── Fetch Nigerian banks from Paystack ─────────────────────────────────────────
export const getBanks = async (req, res) => {
  try {
    console.log('🏦 Fetching banks, key exists:', !!process.env.PAYSTACK_SECRET_KEY);
    
    const paystackRes = await fetch(
      'https://api.paystack.co/bank?currency=NGN&perPage=100',
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const data = await paystackRes.json();
    
    console.log('🏦 Paystack banks response status:', data.status, 'count:', data.data?.length);
    
    if (!data.status) {
      return res.status(500).json({ message: 'Failed to fetch banks' });
    }
    return res.json(data.data.map(b => ({ name: b.name, code: b.code })));
  } catch (error) {
    console.error('getBanks error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Verify bank account via Paystack ──────────────────────────────────────────
export const verifyBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    if (!accountNumber || !bankCode) {
      return res.status(400).json({ message: 'accountNumber and bankCode are required' });
    }

    const paystackRes = await fetch(   // ← renamed from 'response'
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const data = await paystackRes.json();  // ← use paystackRes here too

    console.log('🔍 Paystack resolve:', JSON.stringify(data));

    if (!data.status) {
      return res.status(400).json({ message: data.message || 'Could not verify account.' });
    }

    return res.json({
      accountName:   data.data.account_name,
      accountNumber: data.data.account_number,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
