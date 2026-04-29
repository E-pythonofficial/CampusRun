import prisma from '../lib/prisma.js';
import { runAiVerification } from '../services/ai.service.js';
import { sendApplicationReceivedEmail } from '../services/email.service.js';
// import { emitToAdmin } from '../services/socket.service.js';

// POST /api/runner/apply
// Called when a potential runner submits their application form
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      reasonToJoin,
      matricNumber,
      department,
      college,
      hostel,
      idCardUrl,
      selfieUrl,
    } = req.body;

    // Validate required fields
    if (!reasonToJoin || !idCardUrl || !selfieUrl) {
      return res.status(400).json({
        message: 'reasonToJoin, idCardUrl, and selfieUrl are required',
      });
    }

    // Check if they already have a pending/approved application
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { applicationStatus: true },
    });

    if (
      existing?.applicationStatus &&
      existing.applicationStatus !== 'NOT_APPLIED' &&
      existing.applicationStatus !== 'REJECTED' &&
      existing.applicationStatus !== 'REJECTED_POST_INTERVIEW'
    ) {
      return res.status(409).json({
        message: 'You already have an active application',
        applicationStatus: existing.applicationStatus,
      });
    }

    // Run AI verification on ID card + selfie
    let aiResult = { idCardIsReal: null, faceMatchScore: null, flagged: true, reasons: ['Verification skipped'] };
    try {
      aiResult = await runAiVerification(idCardUrl, selfieUrl);
    } catch (aiError) {
      console.error('AI verification failed, flagging for manual review:', aiError.message);
    }

    // Save application to DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'DISPATCHER',
        reasonToJoin,
        matricNumber: matricNumber || null,
        department: department || null,
        college: college || null,
        hostel: hostel || null,
        idCardUrl,
        selfieUrl,
        applicationStatus: 'PENDING_REVIEW',
        applicationSubmittedAt: new Date(),
        aiIdCardReal: aiResult.idCardIsReal,
        aiFaceMatchScore: aiResult.faceMatchScore,
        aiVerificationFlag: aiResult.flagged,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        matricNumber: true,
        department: true,
        reasonToJoin: true,
        idCardUrl: true,
        selfieUrl: true,
        aiIdCardReal: true,
        aiFaceMatchScore: true,
        aiVerificationFlag: true,
        applicationSubmittedAt: true,
      },
    });

    // Notify admin dashboard in real time — card appears immediately
    emitToAdmin('admin:new_application', updatedUser);

    // Send confirmation email to applicant
    await sendApplicationReceivedEmail(updatedUser.email, updatedUser.fullName);

    return res.status(200).json({
      message: 'Application submitted successfully. Check your email for confirmation.',
      applicationStatus: 'PENDING_REVIEW',
    });
  } catch (error) {
    console.error('submitApplication error:', error);
    return res.status(500).json({ message: 'Failed to submit application' });
  }
};

// GET /api/runner/status
// Runner polls this (or uses socket) to get their current application status
export const getRunnerStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        applicationStatus: true,
        interviewLink: true,
        interviewScheduledAt: true,
        isApproved: true,
        isSuspended: true,
        suspendedUntil: true,
        suspensionReason: true,
        weeklyBalance: true,
        totalEarned: true,
        lastPayoutAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      ...user,
      weeklyBalance: Number(user.weeklyBalance),
      totalEarned: Number(user.totalEarned),
    });
  } catch (error) {
    console.error('getRunnerStatus error:', error);
    return res.status(500).json({ message: 'Failed to fetch runner status' });
  }
};

// GET /api/runner/earnings
// Returns the runner's earnings breakdown
export const getRunnerEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, recentRuns] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          weeklyBalance: true,
          totalEarned: true,
          lastPayoutAt: true,
        },
      }),
      prisma.delivery.findMany({
        where: { runnerId: userId, status: 'COMPLETED' },
        select: {
          id: true,
          item: true,
          runnerGets: true,
          deliveredAt: true,
          createdAt: true,
          requester: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate days until payout
    let daysUntilPayout = null;
    if (user.lastPayoutAt) {
      const nextPayout = new Date(user.lastPayoutAt);
      nextPayout.setDate(nextPayout.getDate() + 7);
      const diff = nextPayout - new Date();
      daysUntilPayout = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return res.json({
      weeklyBalance: Number(user.weeklyBalance),
      totalEarned: Number(user.totalEarned),
      lastPayoutAt: user.lastPayoutAt,
      daysUntilPayout,
      canWithdraw: daysUntilPayout === 0 || daysUntilPayout === null,
      recentRuns: recentRuns.map((r) => ({
        ...r,
        runnerGets: Number(r.runnerGets),
      })),
    });
  } catch (error) {
    console.error('getRunnerEarnings error:', error);
    return res.status(500).json({ message: 'Failed to fetch earnings' });
  }
};