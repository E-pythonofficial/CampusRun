// BACKEND: controllers/adminController.js
// ✅ Revenue now sums DELIVERED + COMPLETED (not just COMPLETED)
// ✅ Added getRunners for the runners tab
// ✅ Added payoutAll for bulk payout
// ✅ weekly/monthly revenue breakdown added

import { PrismaClient } from '@prisma/client';
import { sendEmail }    from '../utils/sendEmail.js';
import axios            from 'axios';
// import { emitToRunner } from '../services/socket.service.js';

const prisma = new PrismaClient();

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const now         = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers, totalOrders,
      completedOrders,
      pendingDispatchers,
      revenueData,        // all-time
      weeklyRevenueData,
      monthlyRevenueData,
      suspendedRunners,
      activeRunners,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.delivery.count(),

      // ✅ count both DELIVERED and COMPLETED
      prisma.delivery.count({
        where: { status: { in: ['DELIVERED', 'COMPLETED'] } },
      }),

      prisma.user.count({ where: { applicationStatus: 'PENDING_REVIEW' } }),

      // ✅ sum companyRevenue from DELIVERED + COMPLETED
      prisma.delivery.aggregate({
        where: { status: { in: ['DELIVERED', 'COMPLETED'] } },
        _sum:  { companyRevenue: true },
      }),

      prisma.delivery.aggregate({
        where: {
          status:    { in: ['DELIVERED', 'COMPLETED'] },
          createdAt: { gte: startOfWeek },
        },
        _sum: { companyRevenue: true },
      }),

      prisma.delivery.aggregate({
        where: {
          status:    { in: ['DELIVERED', 'COMPLETED'] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { companyRevenue: true },
      }),

      prisma.user.count({ where: { role: 'DISPATCHER', isSuspended: true } }),
      prisma.user.count({ where: { role: 'DISPATCHER', isApproved: true, isSuspended: false } }),
    ]);

    return res.status(200).json({
      totalUsers,
      totalOrders,
      completedOrders,
      pendingDispatchers,
      totalRevenue:   Number(revenueData._sum.companyRevenue   ?? 0),
      weeklyRevenue:  Number(weeklyRevenueData._sum.companyRevenue  ?? 0),
      monthlyRevenue: Number(monthlyRevenueData._sum.companyRevenue ?? 0),
      suspendedRunners,
      activeRunners,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get all users ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, fullName: true, email: true,
        role: true, isApproved: true, isVerified: true,
        matricNumber: true, department: true,
        isSuspended: true, suspendedUntil: true,
        applicationStatus: true,
        createdAt: true,
        _count: { select: { deliveries: true, runs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get all approved runners ──────────────────────────────────────────────────
export const getRunners = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);

    const runners = await prisma.user.findMany({
      where: { role: 'DISPATCHER', isApproved: true },
      select: {
        id: true, fullName: true, email: true,
        department: true, matricNumber: true,
        isApproved: true, isSuspended: true,
        suspendedUntil: true, suspensionReason: true,
        weeklyBalance: true, totalEarned: true,
        createdAt: true,
        _count: { select: { runs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with payout eligibility
    // A runner is payout-eligible if weeklyBalance > 0
    // (in production you'd lock for 7 days — for now any positive balance qualifies)
    const enriched = runners.map(r => ({
      ...r,
      weeklyBalance:  Number(r.weeklyBalance),
      totalEarned:    Number(r.totalEarned),
      payoutEligible: Number(r.weeklyBalance) > 0,
      lastPayoutAt:   null, // wire up EarningRecord later
    }));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get pending dispatcher applications ───────────────────────────────────────
export const getPendingDispatchers = async (req, res) => {
  try {
    const pending = await prisma.user.findMany({
      where: { applicationStatus: 'PENDING_REVIEW' },
      select: {
        id: true, fullName: true, email: true,
        matricNumber: true, department: true, college: true,
        reasonToJoin: true, idCardUrl: true, selfieUrl: true,
        aiIdCardReal: true, aiFaceMatchScore: true, aiVerificationFlag: true,
        applicationSubmittedAt: true,
      },
      orderBy: { applicationSubmittedAt: 'desc' },
    });
    return res.status(200).json(pending);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Schedule interview ────────────────────────────────────────────────────────
export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { meetLink, scheduledTime } = req.body;
    if (!meetLink) return res.status(400).json({ message: 'Meet link required' });

    const user = await prisma.user.update({
      where: { id },
      data: {
        applicationStatus:    'INTERVIEW_SCHEDULED',
        interviewLink:        meetLink,
        interviewScheduledAt: scheduledTime ? new Date(scheduledTime) : new Date(),
      },
    });

    await sendEmail({
      to:      user.email,
      subject: '🎉 Campus Run — You Have Been Shortlisted!',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#F97316;">Hi ${user.fullName}!</h2>
          <p>Great news — we reviewed your Campus Run application and you've been shortlisted for an interview!</p>
          <a href="${meetLink}" style="display:inline-block;background:#F97316;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Join Google Meet Interview
          </a>
          ${scheduledTime ? `<p><strong>Time:</strong> ${new Date(scheduledTime).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</p>` : ''}
          <p>Best,<br/><strong>Campus Run Team</strong></p>
        </div>`,
    });

    return res.status(200).json({ message: `Interview scheduled for ${user.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Approve dispatcher ────────────────────────────────────────────────────────
export const approveDispatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: {
        applicationStatus: 'APPROVED',
        isApproved:        true,
        approvedAt:        new Date(),
        role:              'DISPATCHER',
      },
    });

    await sendEmail({
      to:      user.email,
      subject: '✅ Welcome to Campus Run — You Are Approved!',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#F97316;">Congratulations, ${user.fullName}! 🚀</h2>
          <p>You have been officially approved as a <strong>Campus Runner</strong>.</p>
          <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;background:#F97316;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Open App & Start Running
          </a>
          <p><strong>Campus Run Team</strong></p>
        </div>`,
    });

    return res.status(200).json({ message: `${user.fullName} approved` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Reject dispatcher ─────────────────────────────────────────────────────────
export const rejectDispatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, postInterview } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        applicationStatus: postInterview ? 'REJECTED_POST_INTERVIEW' : 'REJECTED',
        isApproved:        false,
        rejectionReason:   reason ?? null,
      },
    });

    await sendEmail({
      to:      user.email,
      subject: 'Campus Run — Application Update',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2>Hi ${user.fullName},</h2>
          <p>Thank you for your interest in Campus Run. After careful review${postInterview ? ' and your interview' : ''}, we are unable to move forward at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p><strong>Campus Run Team</strong></p>
        </div>`,
    });

    return res.status(200).json({ message: `${user.fullName} rejected` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Suspend runner ────────────────────────────────────────────────────────────
export const suspendRunner = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, days } = req.body;
    const suspendDays    = days ?? 7;
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + suspendDays);

    const user = await prisma.user.update({
      where: { id },
      data:  { isSuspended: true, suspendedUntil, suspensionReason: reason },
    });

    await sendEmail({
      to:      user.email,
      subject: '⚠️ Campus Run — Account Suspended',
      html: `<p>Hi ${user.fullName}, your account has been suspended for ${suspendDays} days. ${reason ? `Reason: ${reason}` : ''}</p>`,
    });

    return res.status(200).json({ message: `${user.fullName} suspended for ${suspendDays} days` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Lift suspension ───────────────────────────────────────────────────────────
export const liftSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data:  { isSuspended: false, suspendedUntil: null, suspensionReason: null },
    });

    await sendEmail({
      to:      user.email,
      subject: '✅ Campus Run — Suspension Lifted',
      html:    `<p>Hi ${user.fullName}, your suspension has been lifted. You can accept deliveries again.</p>`,
    });

    return res.status(200).json({ message: `Suspension lifted for ${user.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Nudge runner ──────────────────────────────────────────────────────────────
export const nudgeRunner = async (req, res) => {
  try {
    const { id }      = req.params;
    const { message } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await sendEmail({
      to:      user.email,
      subject: '👋 Campus Run — We Miss You!',
      html:    `<p>Hi ${user.fullName},</p><p>${message ?? "We noticed you haven't been active. Students are waiting for runners!"}</p>`,
    });

    return res.status(200).json({ message: `Nudge email sent to ${user.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Disburse earnings to single runner ───────────────────────────────────────
export const disburseEarnings = async (req, res) => {
  try {
    const { id } = req.params;
    const runner = await prisma.user.findUnique({ where: { id } });
    if (!runner) return res.status(404).json({ message: 'Runner not found' });

    const amount = Number(runner.weeklyBalance);
    if (amount <= 0) return res.status(400).json({ message: 'No balance to disburse' });

    await prisma.user.update({
      where: { id },
      data:  { weeklyBalance: 0 },
    });

    await sendEmail({
      to:      runner.email,
      subject: '💰 Campus Run — Earnings Disbursed!',
      html:    `<p>Hi ${runner.fullName}, your earnings of ₦${amount.toLocaleString()} have been disbursed.</p>`,
    });

    return res.status(200).json({ message: `₦${amount.toLocaleString()} disbursed to ${runner.fullName}`, amount });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Payout ALL eligible runners at once ──────────────────────────────────────
export const payoutAll = async (req, res) => {
  try {
    const eligible = await prisma.user.findMany({
      where: { role: 'DISPATCHER', isApproved: true, weeklyBalance: { gt: 0 } },
    });

    if (eligible.length === 0) {
      return res.status(400).json({ message: 'No runners with balance to pay out' });
    }

    const total = eligible.reduce((sum, r) => sum + Number(r.weeklyBalance), 0);

    // Reset all balances to 0
    await prisma.user.updateMany({
      where: { id: { in: eligible.map(r => r.id) } },
      data:  { weeklyBalance: 0 },
    });

    // Send email to each
    await Promise.allSettled(
      eligible.map(r =>
        sendEmail({
          to:      r.email,
          subject: '💰 Campus Run — Earnings Disbursed!',
          html:    `<p>Hi ${r.fullName}, your earnings of ₦${Number(r.weeklyBalance).toLocaleString()} have been paid out.</p>`,
        })
      )
    );

    return res.status(200).json({
      message:     `Paid out ${eligible.length} runners — ₦${total.toLocaleString()} total`,
      count:       eligible.length,
      totalAmount: total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Unlock mature earnings (cron job endpoint) ────────────────────────────────
export const unlockMatureEarnings = async (req, res) => {
  try {
    // No EarningRecord model yet — placeholder for when you add it
    return res.status(200).json({ message: 'Earning unlock: no EarningRecord model yet — add it when needed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Refund user via Paystack ──────────────────────────────────────────────────
export const refundUser = async (req, res) => {
  try {
    const { deliveryId, reason } = req.body;
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId }, include: { requester: true },
    });

    if (!delivery)            return res.status(404).json({ message: 'Delivery not found' });
    if (!delivery.paystackRef) return res.status(400).json({ message: 'No payment reference for this delivery' });

    const paystackRes = await axios.post(
      'https://api.paystack.co/refund',
      { transaction: delivery.paystackRef },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    if (paystackRes.data.status) {
      await prisma.delivery.update({ where: { id: deliveryId }, data: { status: 'CANCELLED' } });
      await sendEmail({
        to:      delivery.requester.email,
        subject: '💳 Campus Run — Refund Initiated',
        html:    `<p>Hi ${delivery.requester.fullName}, your refund of ₦${Number(delivery.totalPrice).toLocaleString()} has been initiated. ${reason ? `Reason: ${reason}` : ''}</p>`,
      });
    }

    return res.status(200).json({ message: 'Refund initiated', data: paystackRes.data.data });
  } catch (error) {
    return res.status(500).json({ message: 'Refund failed. Try via Paystack dashboard.' });
  }
};

// ── Get all deliveries ────────────────────────────────────────────────────────
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        requester: { select: { fullName: true, email: true } },
        runner:    { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(deliveries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get runner earnings detail ────────────────────────────────────────────────
export const getRunnerEarnings = async (req, res) => {
  try {
    const { id } = req.params;
    const runner = await prisma.user.findUnique({
      where:  { id },
      select: { fullName: true, email: true, weeklyBalance: true, totalEarned: true },
    });
    if (!runner) return res.status(404).json({ message: 'Runner not found' });
    return res.status(200).json({ runner });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};