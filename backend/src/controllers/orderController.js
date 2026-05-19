// BACKEND: controllers/orderController.js
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// CREATE ORDER — initializes Paystack payment
// ─────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { item, pickup, dropoff, userId, fare } = req.body;

    if (!item || !pickup || !dropoff || !userId || !fare) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email:        user.email,
        amount:       fare.userPays * 100,
        bearer:       'subaccount',
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        metadata: {
          cancel_action:  `${process.env.FRONTEND_URL}/requester`,
          userId,
          runnerGets:     fare.runnerGets,
          companyRevenue: fare.companyRevenue,
          distanceMeters: fare.distanceMeters,
        },
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Generate a 4-digit handshake PIN for this order
    const handshakePin = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder = await prisma.delivery.create({
      data: {
        item,
        pickupAddress:  pickup.address,
        pickupLat:      pickup.lat,
        pickupLng:      pickup.lng,
        dropoffAddress: dropoff.address,
        dropoffLat:     dropoff.lat,
        dropoffLng:     dropoff.lng,
        distanceMeters: fare.distanceMeters,
        totalPrice:     fare.userPays,
        runnerGets:     fare.runnerGets,
        companyRevenue: fare.companyRevenue,
        status:         'PENDING_PAYMENT',
        paystackRef:    paystackRes.data.data.reference,
        handshakePin,           // ← stored in DB, shown to user
        requesterId:    userId,
      },
    });

    notifyAvailableRunners(newOrder); 

    return res.status(200).json({
      url:     paystackRes.data.data.authorization_url,
      orderId: newOrder.id,
    });

  } catch (error) {
    console.error('Order Error:', error.message);
    return res.status(500).json({ message: 'Failed to initialize order' });
  }
};

// ─────────────────────────────────────────────────────────────
// CONFIRM DELIVERY — runner enters PIN to complete handover
// Called by the DISPATCHER app when runner enters the PIN
// ─────────────────────────────────────────────────────────────
export const confirmDelivery = async (req, res) => {
  try {
    const { orderId, pin } = req.body;

    if (!orderId || !pin) {
      return res.status(400).json({ message: 'orderId and pin are required' });
    }

    const order = await prisma.delivery.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({ message: 'Order already delivered' });
    }

    if (order.status !== 'PAID') {
      return res.status(400).json({ message: 'Order is not in a deliverable state' });
    }

    // Validate the PIN
    if (order.handshakePin !== pin.toString()) {
      return res.status(401).json({ message: 'Incorrect PIN. Try again.' });
    }

    // Mark as DELIVERED
    const updated = await prisma.delivery.update({
      where: { id: orderId },
      data:  { status: 'DELIVERED', deliveredAt: new Date() },
    });

    return res.status(200).json({
      status:  'success',
      message: 'Delivery confirmed!',
      order:   updated,
    });

  } catch (error) {
    console.error('Confirm Delivery Error:', error.message);
    return res.status(500).json({ message: 'Failed to confirm delivery' });
  }
};