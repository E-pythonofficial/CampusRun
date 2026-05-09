import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE   = 'https://api.paystack.co';

// ── Create Paystack transfer recipient when bank details are saved ─────────────
// Call this from saveBankDetails in runnerController.js
export const createTransferRecipient = async (accountNumber, bankCode, accountName) => {
  const res = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${PAYSTACK_SECRET}`,
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
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Failed to create recipient');
  return data.data.recipient_code; // e.g. "RCP_1a25w1h3n0xctjg"
};

// ── POST /api/runner/withdraw ─────────────────────────────────────────────────
export const withdrawEarnings = async (req, res) => {
  try {
    const runnerId = req.user.id;

    const runner = await prisma.user.findUnique({
      where:  { id: runnerId },
      select: {
        fullName:               true,
        weeklyBalance:          true,
        paystackRecipientCode:  true,
        bankName:               true,
      },
    });

    // Guards
    if (!runner) {
      return res.status(404).json({ message: 'Runner not found' });
    }
    if (!runner.paystackRecipientCode) {
      return res.status(400).json({ message: 'No bank account linked. Go to Payment Methods and save your bank details first.' });
    }
    const balance = Number(runner.weeklyBalance ?? 0);
    if (balance < 100) {
      return res.status(400).json({ message: `Minimum withdrawal is ₦100. Your balance is ₦${balance}.` });
    }

    const amountInKobo = balance * 100; // Paystack uses kobo

    // Initiate transfer via Paystack
    const transferRes = await fetch(`${PAYSTACK_BASE}/transfer`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source:    'balance',
        amount:    amountInKobo,
        recipient: runner.paystackRecipientCode,
        reason:    `CampusRun payout — ${runner.fullName}`,
      }),
    });

    const transferData = await transferRes.json();

    if (!transferData.status) {
      console.error('Paystack transfer failed:', transferData);
      return res.status(500).json({ message: transferData.message || 'Transfer failed. Try again.' });
    }

    const transferCode = transferData.data.transfer_code;

    // Deduct balance and log the payout atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: runnerId },
        data:  { weeklyBalance: 0, lastPayoutAt: new Date() },
      }),
      prisma.payout.create({
        data: {
          runnerId,
          amount:       balance,
          transferCode,
          status:       'PENDING', // webhook will update to SUCCESS or FAILED
          bankName:     runner.bankName ?? '',
        },
      }),
    ]);

    return res.status(200).json({
      message:      `Transfer of ₦${balance.toLocaleString()} initiated to ${runner.bankName}. You'll receive it shortly.`,
      transferCode,
      amount:       balance,
    });

  } catch (error) {
    console.error('withdrawEarnings error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ── GET /api/runner/payout-history ────────────────────────────────────────────
export const getPayoutHistory = async (req, res) => {
  try {
    const runnerId = req.user.id;

    const payouts = await prisma.payout.findMany({
      where:   { runnerId },
      orderBy: { createdAt: 'desc' },
      take:    20,
    });

    return res.json(payouts.map(p => ({
      id:           p.id,
      amount:       Number(p.amount),
      status:       p.status,      // PENDING | SUCCESS | FAILED
      bankName:     p.bankName,
      transferCode: p.transferCode,
      createdAt:    p.createdAt,
    })));

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── POST /api/webhooks/paystack ───────────────────────────────────────────────
// IMPORTANT: must receive RAW body — registered in server.js BEFORE express.json()
export const paystackWebhook = async (req, res) => {
  try {
    // Verify the request is actually from Paystack
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(req.body) // raw Buffer
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.warn('⚠️  Paystack webhook signature mismatch — rejected');
      return res.sendStatus(400);
    }

    const event = JSON.parse(req.body.toString());
    console.log('📦 Paystack webhook event:', event.event);

    if (event.event === 'transfer.success') {
      await prisma.payout.updateMany({
        where: { transferCode: event.data.transfer_code },
        data:  { status: 'SUCCESS' },
      });
      console.log('✅ Payout marked SUCCESS:', event.data.transfer_code);
    }

    if (event.event === 'transfer.failed') {
      const { transfer_code, amount } = event.data;

      // Refund the dispatcher's balance
      const payout = await prisma.payout.findFirst({
        where: { transferCode: transfer_code },
      });

      if (payout) {
        await prisma.$transaction([
          prisma.payout.update({
            where: { id: payout.id },
            data:  { status: 'FAILED' },
          }),
          prisma.user.update({
            where: { id: payout.runnerId },
            data:  { weeklyBalance: { increment: Number(amount) / 100 } }, // kobo → naira
          }),
        ]);
        console.log('❌ Payout FAILED — balance refunded for runner:', payout.runnerId);
      }
    }

    if (event.event === 'transfer.reversed') {
      await prisma.payout.updateMany({
        where: { transferCode: event.data.transfer_code },
        data:  { status: 'FAILED' },
      });
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error('paystackWebhook error:', error);
    return res.sendStatus(500);
  }
};