import axios from 'axios';

const TERMII_BASE = 'https://api.ng.termii.com/api';

export const sendSMS = async (phone, message) => {
  try {
    const res = await axios.post(`${TERMII_BASE}/sms/send`, {
      to:          phone,
      from:        process.env.TERMII_SENDER_ID || 'CampusRun',
      sms:         message,
      type:        'plain',
      channel:     'generic',
      api_key:     process.env.TERMII_API_KEY,
    });
    console.log('✅ SMS sent:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ SMS failed:', err.message);
    // Don't throw — SMS failure shouldn't block order creation
  }
};

// Notify all available runners about a new order
export const notifyAvailableRunners = (order) => {
  // Get all runners who are marked as available
  const runners = await prisma.user.findMany({
    where: {
      role:        'DISPATCHER',
      isApproved:  true,
      isAvailable: true,  // ← new field (see schema below)
      phone:       { not: null },
    },
    select: { phone: true, fullName: true },
  });

  const message = 
    `🏃 CampusRun Alert!\n` +
    `New delivery: ${order.item}\n` +
    `From: ${order.pickupAddress}\n` +
    `Earn: ₦${order.runnerGets}\n` +
    `Open app to accept!`;

  // Send to all available runners simultaneously
  await Promise.allSettled(
    runners.map(r => sendSMS(r.phone, message))
  );

  console.log(`📱 SMS sent to ${runners.length} available runners`);
};