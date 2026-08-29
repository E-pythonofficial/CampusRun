// BACKEND: controllers/adminController.js
// ✅ Revenue sums DELIVERED + COMPLETED
// ✅ getRunners for runners tab
// ✅ payoutAll for bulk payout
// ✅ weekly/monthly revenue breakdown
// ✅ Socket import removed — admin actions don't need to emit (runnerController does)

import { PrismaClient } from '@prisma/client';
import { sendPushToUser } from '../utils/push.js';
import { sendEmail }    from '../utils/sendEmail.js';
import axios            from 'axios';

const prisma = new PrismaClient();

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const now          = new Date();
    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers, totalOrders, completedOrders,
      pendingDispatchers,
      revenueData, weeklyRevenueData, monthlyRevenueData,
      suspendedRunners, activeRunners,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.delivery.count(),
      prisma.delivery.count({ where: { status: { in: ['DELIVERED', 'COMPLETED'] } } }),
      prisma.user.count({ where: { applicationStatus: 'PENDING_REVIEW' } }),
      prisma.delivery.aggregate({
        where: { status: { in: ['DELIVERED', 'COMPLETED'] } },
        _sum:  { companyRevenue: true },
      }),
      prisma.delivery.aggregate({
        where: { status: { in: ['DELIVERED', 'COMPLETED'] }, createdAt: { gte: startOfWeek } },
        _sum:  { companyRevenue: true },
      }),
      prisma.delivery.aggregate({
        where: { status: { in: ['DELIVERED', 'COMPLETED'] }, createdAt: { gte: startOfMonth } },
        _sum:  { companyRevenue: true },
      }),
      prisma.user.count({ where: { role: 'DISPATCHER', isSuspended: true } }),
      prisma.user.count({ where: { role: 'DISPATCHER', isApproved: true, isSuspended: false } }),
    ]);

    return res.status(200).json({
      totalUsers, totalOrders, completedOrders, pendingDispatchers,
      totalRevenue:   Number(revenueData._sum.companyRevenue        ?? 0),
      weeklyRevenue:  Number(weeklyRevenueData._sum.companyRevenue  ?? 0),
      monthlyRevenue: Number(monthlyRevenueData._sum.companyRevenue ?? 0),
      suspendedRunners, activeRunners,
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
        applicationStatus: true, createdAt: true,
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

    const enriched = runners.map(r => ({
      ...r,
      weeklyBalance:  Number(r.weeklyBalance),
      totalEarned:    Number(r.totalEarned),
      payoutEligible: Number(r.weeklyBalance) > 0,
      lastPayoutAt:   null,
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

// ── Schedule interview — FIXED ────────────────────────────────────────────────
// Fix: select was missing email on the returned user after update
// Fix: guard against missing email before calling sendEmail
export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { meetLink, scheduledTime } = req.body;

    if (!meetLink) return res.status(400).json({ message: 'Meet link required' });

    // Step 1: update the record
    await prisma.user.update({
      where: { id },
      data: {
        applicationStatus:    'INTERVIEW_SCHEDULED',
        interviewLink:        meetLink,
        interviewScheduledAt: scheduledTime ? new Date(scheduledTime) : new Date(),
      },
    });

    // Step 2: fetch the user SEPARATELY so we always get email + fullName
    // (update with select can sometimes miss fields if the record has nulls)
    const user = await prisma.user.findUnique({
      where:  { id },
      select: { email: true, fullName: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found after update' });
    if (!user.email) return res.status(400).json({ message: 'User has no email address on record' });

    await sendEmail({
      to:      user.email,
      subject: '🎉 Campus Run — You Have Been Shortlisted!',
      html: `
        <div style="font-family:sans-serif;padding:24px;">
          <h2 style="color:#F97316;">Hi ${user.fullName}!</h2>
          <p>You've been shortlisted for a Campus Run runner interview!</p>
          <p>Please join us using the link below:</p>
          <a href="${meetLink}"
             style="display:inline-block;background:#F97316;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Join Google Meet Interview
          </a>
          ${scheduledTime
            ? `<p><strong>Scheduled Time:</strong> ${new Date(scheduledTime).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</p>`
            : ''}
          <p>Come prepared to talk about yourself and why you want to join Campus Run.</p>
          <p><strong>Campus Run Team</strong></p>
        </div>
      `,
    });

    return res.status(200).json({ message: `Interview scheduled for ${user.fullName}` });
  } catch (error) {
    console.error('scheduleInterview error:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ── Reject dispatcher — FIXED ─────────────────────────────────────────────────
// Fix: same pattern — update first, then fetch to guarantee email is present
export const rejectDispatcher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, postInterview } = req.body;

    // Step 1: update status
    await prisma.user.update({
      where: { id },
      data: {
        applicationStatus: postInterview ? 'REJECTED_POST_INTERVIEW' : 'REJECTED',
        isApproved:        false,
        rejectionReason:   reason ?? null,
      },
    });

    // Step 2: fetch separately to guarantee we have email
    const user = await prisma.user.findUnique({
      where:  { id },
      select: { email: true, fullName: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found after update' });
    if (!user.email) return res.status(400).json({ message: 'User has no email address on record' });

    await sendEmail({
      to:      user.email,
      subject: 'Campus Run — Application Update',
      html: `
        <div style="font-family:sans-serif;padding:24px;">
          <h2>Hi ${user.fullName},</h2>
          <p>Thank you for your interest in joining Campus Run as a runner.</p>
          <p>After careful review${postInterview ? ' and your interview' : ''},
             we are unable to move forward with your application at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>You are still welcome to use Campus Run as a customer.</p>
          <p><strong>Campus Run Team</strong></p>
        </div>
      `,
    });

    sendPushToUser(prisma,user.id,{
      title:"Application Update",
      body:"Your Campus Run runner application has been reviewed.",
      data:{
        type:"REJECTED"
 }
})

    return res.status(200).json({ message: `${user.fullName} rejected successfully` });
  } catch (error) {
    console.error('rejectDispatcher error:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ── Approve dispatcher — FIXED (same pattern for consistency) ─────────────────
export const approveDispatcher = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: {
        applicationStatus: 'APPROVED',
        isApproved:        true,
        approvedAt:        new Date(),
        role:              'DISPATCHER',
      },
    });

    const user = await prisma.user.findUnique({
      where:  { id },
      select: { email: true, fullName: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found after update' });
    if (!user.email) return res.status(400).json({ message: 'User has no email address on record' });

    await sendEmail({
      to:      user.email,
      subject: '✅ Welcome to Campus Run — You Are Approved!',
      html: `
        <div style="font-family:sans-serif;padding:24px;">
          <h2 style="color:#F97316;">Congratulations, ${user.fullName}! 🚀</h2>
          <p>You have been officially approved as a <strong>Campus Runner</strong>.</p>
          <p>Log in now to access your runner dashboard and start accepting deliveries.</p>
          <a href="${process.env.FRONTEND_URL}/login"
             style="display:inline-block;background:#F97316;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Open App & Start Running
          </a>
          <p>Every delivery you complete earns you money, paid out every 7 days.</p>
          <p><strong>Campus Run Team</strong></p>
        </div>
      `,
    });

    await sendPushToUser(
      prisma,
      user.id,
      {
        title: '🎉 Application Approved',
        body: 'Congratulations! You are now approved as a Campus Run runner.',
        data: {
          type: 'APPLICATION_APPROVED',
          userId: user.id,
        },
      }
  );

    return res.status(200).json({ message: `${user.fullName} approved` });
  } catch (error) {
    console.error('approveDispatcher error:', error);
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
      data:  { isSuspended: true, suspendedUntil, suspensionReason: reason ?? null },
    });

    await sendEmail({
      to: user.email, subject: '⚠️ Campus Run — Account Suspended',
      html: `<p>Hi ${user.fullName}, your account has been suspended for ${suspendDays} days.${reason ? ` Reason: ${reason}` : ''}</p>`,
    });

    sendPushToUser(prisma,id,{title:"⚠️ Account Suspended",body:"Your Campus Run account has been temporarily suspended.",
      data:{type:"SUSPENDED"
 }
})

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
      to: user.email, subject: '✅ Campus Run — Suspension Lifted',
      html: `<p>Hi ${user.fullName}, your suspension has been lifted. You can accept deliveries again.</p>`,
    });

    sendPushToUser(prisma,id,{
      title:"✅ Account Restored",
      body:"Your Campus Run account is active again.",data:{type:"SUSPENSION_LIFTED"
 }
})

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
      to: user.email, subject: '👋 Campus Run — We Miss You!',
      html: `<p>Hi ${user.fullName},</p><p>${message ?? "We noticed you haven't been active. Students are waiting for runners!"}</p>`,
    });

    return res.status(200).json({ message: `Nudge email sent to ${user.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


// ── Unlock mature earnings (placeholder) ──────────────────────────────────────
export const unlockMatureEarnings = async (req, res) => {
  return res.status(200).json({ message: 'No EarningRecord model yet — add when needed' });
};

// ── Refund via Paystack ───────────────────────────────────────────────────────
export const refundUser = async (req, res) => {
  try {
    const { deliveryId, reason } = req.body;
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId }, include: { requester: true },
    });

    if (!delivery)             return res.status(404).json({ message: 'Delivery not found' });
    if (!delivery.paystackRef) return res.status(400).json({ message: 'No payment reference for this delivery' });

    const paystackRes = await axios.post(
      'https://api.paystack.co/refund',
      { transaction: delivery.paystackRef },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    if (paystackRes.data.status) {
      await prisma.delivery.update({ where: { id: deliveryId }, data: { status: 'CANCELLED' } });
      await sendEmail({
        to: delivery.requester.email, subject: '💳 Campus Run — Refund Initiated',
        html: `<p>Hi ${delivery.requester.fullName}, your refund of ₦${Number(delivery.totalPrice).toLocaleString()} has been initiated.${reason ? ` Reason: ${reason}` : ''}</p>`,
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
    return res.status(200).json({
      runner: { ...runner, weeklyBalance: Number(runner.weeklyBalance), totalEarned: Number(runner.totalEarned) },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// ── Paystack helpers ──────────────────────────────────────────────────────────
const createRecipient = async (accountName, accountNumber, bankCode) => {
  const paystackRes = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type:           'nuban',
      name:           accountName,
      account_number: accountNumber,
      bank_code:      bankCode,
      currency:       'NGN',
    }),
  });
  const data = await paystackRes.json();
  console.log('🏦 createRecipient:', JSON.stringify(data));
  if (!data.status) throw new Error(data.message || 'Failed to create recipient');
  return data.data.recipient_code;
};

const initiateTransfer = async (amount, recipientCode, runnerId) => {
  const paystackRes = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source:    'balance',
      amount:    Math.round(amount * 100), // kobo
      recipient: recipientCode,
      reason:    `CampusRun weekly payout - Runner ${runnerId}`,
    }),
  });
  const data = await paystackRes.json();
  console.log('💸 initiateTransfer:', JSON.stringify(data));
  if (!data.status) throw new Error(data.message || 'Transfer failed');
  return data.data;
};

// ── POST /api/admin/runners/:id/payout ───────────────────────────────────────
export const payoutRunner = async (req, res) => {
  try {
    const runnerId = req.params.id;

    const runner = await prisma.user.findUnique({
      where:  { id: runnerId },
      select: {
        id: true, fullName: true, email: true,
        bankName: true, bankCode: true,
        accountNumber: true, accountName: true,
        weeklyBalance: true,
      },
    });

    if (!runner) return res.status(404).json({ message: 'Runner not found' });
    if (!runner.bankCode || !runner.accountNumber || !runner.accountName) {
      return res.status(400).json({ message: 'Runner has no bank details saved' });
    }

    const amount = Number(runner.weeklyBalance);
    if (amount <= 0) return res.status(400).json({ message: 'Runner has no balance to pay out' });

    const recipientCode = await createRecipient(
      runner.accountName, runner.accountNumber, runner.bankCode,
    );
    const transfer = await initiateTransfer(amount, recipientCode, runnerId);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: runnerId },
        data:  { weeklyBalance: 0, lastPayoutAt: new Date() },
      }),
      prisma.payout.create({
        data: {
          runnerId,
          amount,
          reference:    transfer.reference,
          status:       transfer.status,
          transferCode: transfer.transfer_code,
        },
      }),
    ]);

    await sendEmail({
      to:      runner.email,
      subject: '💰 Campus Run — Earnings Paid!',
      html: `<p>Hi ${runner.fullName}, your earnings of ₦${amount.toLocaleString()} have been sent to your ${runner.bankName} account. It should arrive within minutes.</p>`,
    });

    sendPushToUser(prisma,runner.id,{title:"💰 Earnings Paid", body:`₦${amount.toLocaleString()} has been sent to your account.`,
    data:{
      type:"PAYOUT_SUCCESS",
      amount:String(amount)
 }
})

    return res.status(200).json({
      message: `Payout of ₦${amount.toLocaleString()} initiated for ${runner.fullName}`,
      transfer,
    });
  } catch (error) {
    console.error('payoutRunner error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const disburseEarnings = payoutRunner; // keep alias

// ── POST /api/admin/runners/payout-all ───────────────────────────────────────
export const payoutAllEligible = async (req, res) => {
  try {
    const runners = await prisma.user.findMany({
      where: {
        role:          'DISPATCHER',
        isApproved:    true,
        weeklyBalance: { gt: 0 },
        bankCode:      { not: null },
        accountNumber: { not: null },
        accountName:   { not: null },
      },
    });

    if (runners.length === 0) {
      return res.status(200).json({ message: 'No runners with pending balance' });
    }

    const results = [];

    for (const runner of runners) {
      try {
        const amount = Number(runner.weeklyBalance);
        const recipientCode = await createRecipient(
          runner.accountName, runner.accountNumber, runner.bankCode,
        );
        const transfer = await initiateTransfer(amount, recipientCode, runner.id);

        await prisma.$transaction([
          prisma.user.update({
            where: { id: runner.id },
            data:  { weeklyBalance: 0, lastPayoutAt: new Date() },
          }),
          prisma.payout.create({
            data: {
              runnerId:     runner.id,
              amount,
              reference:    transfer.reference,
              status:       transfer.status,
              transferCode: transfer.transfer_code,
            },
          }),
        ]);

        await sendEmail({
          to:      runner.email,
          subject: '💰 Campus Run — Earnings Paid!',
          html:    `<p>Hi ${runner.fullName}, ₦${amount.toLocaleString()} has been sent to your bank account.</p>`,
        });

        await sendPushToUser(prisma, runner.id,{title:'💰 Earnings Paid', body:`Your earnings of ₦${amount.toLocaleString()} have been sent.`,
        data:{
          type:'PAYOUT_SUCCESS',
          amount:String(amount)
    }
  }
);

        results.push({ runner: runner.fullName, amount, status: 'success' });
      } catch (err) {
        results.push({ runner: runner.fullName, status: 'failed', error: err.message });
      }
    }

    return res.status(200).json({ message: 'Payout batch complete', results });
  } catch (error) {
    console.error('payoutAllEligible error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const payoutAll = payoutAllEligible; // keep alias

// ── Paystack webhook ──────────────────────────────────────────────────────────
export const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'transfer.success') {
      await prisma.payout.updateMany({
        where: { reference: event.data.reference },
        data:  { status: 'success' },
      });
    }

    if (event.event === 'transfer.failed' || event.event === 'transfer.reversed') {
      const payout = await prisma.payout.findFirst({
        where: { reference: event.data.reference },
      });
      if (payout) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: payout.runnerId },
            data:  { weeklyBalance: { increment: payout.amount } },
          }),
          prisma.payout.update({
            where: { id: payout.id },
            data:  { status: 'failed' },
          }),
        ]);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('webhook error:', error);
    return res.status(200).json({ received: true });
  }
};