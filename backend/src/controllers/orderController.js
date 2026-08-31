// BACKEND: controllers/orderController.js

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '../utils/push.js';

const prisma = new PrismaClient();


// ============================================================
// NOTIFY AVAILABLE / ONLINE DISPATCHERS
// ============================================================

const notifyAvailableRunners = async (order) => {
  try {
    const availableRunners = await prisma.user.findMany({
      where: {
        role: 'DISPATCHER',
        isApproved: true,
        isSuspended: false,
        isAvailable: true,
        isOnline: true,
        lastSeenAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000),
        },
      },
      select: {
        id: true,
      },
    });

    if (availableRunners.length === 0) {
      console.log('No available dispatchers to notify.');
      return;
    }

    const runnerIds = availableRunners.map((runner) => runner.id);

    const tokens = await prisma.pushToken.findMany({
      where: {
        userId: {
          in: runnerIds,
        },
      },
    });

    if (tokens.length === 0) {
      console.log('No push tokens found for available dispatchers.');
      return;
    }

    const payload = {
      title: 'New delivery available! 📦',
      body: `${order.item} — pickup at ${order.pickupAddress}`,
      data: {
        orderId: order.id,
      },
    };

    for (const tokenRecord of tokens) {
      try {
        const result = await sendPushNotification(
          tokenRecord.token,
          payload
        );

        // Remove expired/invalid push tokens
        if (result?.expired) {
          await prisma.pushToken
            .delete({
              where: {
                id: tokenRecord.id,
              },
            })
            .catch(() => {});
        }
      } catch (error) {
        console.error(
          `Push notification failed for token ${tokenRecord.id}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      'notifyAvailableRunners error:',
      error.message
    );

    // IMPORTANT:
    // Notification failure must never block order creation/payment.
  }
};


// ============================================================
// CHECK WHETHER THERE IS AN AVAILABLE DISPATCHER
// ============================================================

const hasAvailableDispatcher = async () => {
  const count = await prisma.user.count({
    where: {
      role: 'DISPATCHER',
      isApproved: true,
      isSuspended: false,
      isAvailable: true,
      isOnline: true,
      lastSeenAt: {
        gte: new Date(Date.now() - 2 * 60 * 1000),
      },
    },
  });

  return count > 0;
};


// ============================================================
// CREATE ORDER — INITIALIZES PAYSTACK PAYMENT
// ============================================================

export const createOrder = async (req, res) => {
  try {
    const {
      item,
      pickup,
      dropoff,
      userId,
      fare,
      itemImageUrl,
    } = req.body;

    // --------------------------------------------------------
    // Validate required fields
    // --------------------------------------------------------

    if (
      !item ||
      !pickup ||
      !dropoff ||
      !userId ||
      !fare
    ) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    // Validate pickup/dropoff structure
    if (
      pickup.address == null ||
      pickup.lat == null ||
      pickup.lng == null ||
      dropoff.address == null ||
      dropoff.lat == null ||
      dropoff.lng == null
    ) {
      return res.status(400).json({
        message:
          'Invalid pickup or dropoff location data',
      });
    }

    // Validate fare structure
    if (
      fare.userPays == null ||
      fare.runnerGets == null ||
      fare.companyRevenue == null ||
      fare.distanceMeters == null
    ) {
      return res.status(400).json({
        message: 'Invalid fare information',
      });
    }

    // --------------------------------------------------------
    // Find requester
    // --------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // --------------------------------------------------------
    // CHECK AVAILABLE DISPATCHERS BEFORE PAYSTACK
    // --------------------------------------------------------

    const availableDispatcher =
      await hasAvailableDispatcher();

    if (!availableDispatcher) {
      return res.status(409).json({
        code: 'NO_DISPATCHER_AVAILABLE',
        message:
          'No dispatchers are currently available. Please try again in a few minutes.',
      });
    }

    // --------------------------------------------------------
    // INITIALIZE PAYSTACK PAYMENT
    // --------------------------------------------------------

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,

        // Paystack expects amount in kobo
        amount: Math.round(Number(fare.userPays) * 100),

        bearer: 'subaccount',

        callback_url: `${process.env.FRONTEND_URL}/payment-success`,

        metadata: {
          cancel_action: `${process.env.FRONTEND_URL}/requester`,
          userId,
          runnerGets: fare.runnerGets,
          companyRevenue: fare.companyRevenue,
          distanceMeters: fare.distanceMeters,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // --------------------------------------------------------
    // Make sure Paystack returned the required data
    // --------------------------------------------------------

    const paymentData = paystackRes?.data?.data;

    if (!paymentData?.reference || !paymentData?.authorization_url) {
      console.error(
        'Invalid Paystack response:',
        paystackRes?.data
      );

      return res.status(500).json({
        message:
          'Payment initialization failed. Please try again.',
      });
    }

    // --------------------------------------------------------
    // Generate a 4-digit handshake PIN
    // --------------------------------------------------------

    const handshakePin = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    // --------------------------------------------------------
    // CREATE DELIVERY ORDER
    // --------------------------------------------------------

    const newOrder = await prisma.delivery.create({
      data: {
        item,

        itemImageUrl: itemImageUrl || null,

        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,

        dropoffAddress: dropoff.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,

        distanceMeters: fare.distanceMeters,

        totalPrice: fare.userPays,
        runnerGets: fare.runnerGets,
        companyRevenue: fare.companyRevenue,

        status: 'PENDING_PAYMENT',

        paystackRef: paymentData.reference,

        // Stored in DB and shown to requester
        handshakePin,

        requesterId: userId,
      },
    });

    // --------------------------------------------------------
    // NOTIFY AVAILABLE DISPATCHERS
    //
    // Do NOT await this.
    // A push notification failure should never prevent
    // the requester from receiving the Paystack URL.
    // --------------------------------------------------------

    notifyAvailableRunners(newOrder).catch((error) => {
      console.error(
        'Background dispatcher notification error:',
        error.message
      );
    });

    // --------------------------------------------------------
    // RETURN PAYMENT URL
    // --------------------------------------------------------

    return res.status(200).json({
      url: paymentData.authorization_url,
      orderId: newOrder.id,
    });
  } catch (error) {
    console.error(
      'Order Error:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: 'Failed to initialize order',
    });
  }
};


// ============================================================
// CONFIRM DELIVERY — RUNNER ENTERS PIN
// ============================================================
// Called by the DISPATCHER app when runner enters the PIN
// ============================================================

export const confirmDelivery = async (req, res) => {
  try {
    const { orderId, pin } = req.body;

    // --------------------------------------------------------
    // Validate request
    // --------------------------------------------------------

    if (!orderId || !pin) {
      return res.status(400).json({
        message: 'orderId and pin are required',
      });
    }

    // --------------------------------------------------------
    // Find order
    // --------------------------------------------------------

    const order = await prisma.delivery.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // --------------------------------------------------------
    // Check delivery status
    // --------------------------------------------------------

    if (order.status === 'DELIVERED') {
      return res.status(400).json({
        message: 'Order already delivered',
      });
    }

    if (order.status !== 'PAID') {
      return res.status(400).json({
        message:
          'Order is not in a deliverable state',
      });
    }

    // --------------------------------------------------------
    // Validate handshake PIN
    // --------------------------------------------------------

    if (order.handshakePin !== pin.toString()) {
      return res.status(401).json({
        message: 'Incorrect PIN. Try again.',
      });
    }

    // --------------------------------------------------------
    // Mark order as delivered
    // --------------------------------------------------------

    const updated = await prisma.delivery.update({
      where: {
        id: orderId,
      },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });

    // --------------------------------------------------------
    // Return success
    // --------------------------------------------------------

    return res.status(200).json({
      status: 'success',
      message: 'Delivery confirmed!',
      order: updated,
    });
  } catch (error) {
    console.error(
      'Confirm Delivery Error:',
      error.message
    );

    return res.status(500).json({
      message: 'Failed to confirm delivery',
    });
  }
};