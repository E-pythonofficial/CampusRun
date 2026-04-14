import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req, res) => {
  try {
    const { item, pickup, dropoff, userId } = req.body;
    // pickup and dropoff should be objects: { address, lat, lng }

    // 1. Get Distance from Google Maps API
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    const distanceResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickup.lat},${pickup.lng}&destinations=${dropoff.lat},${dropoff.lng}&key=${googleMapsKey}`
    );

    const distanceInMeters = distanceResponse.data.rows[0].elements[0].distance.value;

    // 2. Apply Your Formula
    // Base 400 + (meters / 500 * 100)
    const baseAmount = 400;
    const distanceCharge = Math.ceil(distanceInMeters / 500) * 100;
    const totalAmount = baseAmount + distanceCharge;

    // 3. Initialize Paystack
    // Note: Paystack takes amount in KOBO (multiply by 100)
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email, // From your auth middleware
        amount: totalAmount * 100, 
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        metadata: {
          cancel_action: `${process.env.FRONTEND_URL}/requester-dashboard`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Save to Database as PENDING
    const newOrder = await prisma.delivery.create({
      data: {
        item,
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffAddress: dropoff.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        distanceMeters: distanceInMeters,
        totalPrice: totalAmount,
        status: 'PENDING',
        paystackRef: paystackResponse.data.data.reference,
        requesterId: userId,
      },
    });

    // 5. Return the Paystack URL to the frontend
    res.status(200).json({
      url: paystackResponse.data.data.authorization_url,
      orderId: newOrder.id
    });

  } catch (error) {
    console.error('Order Error:', error);
    res.status(500).json({ message: 'Failed to initialize order' });
  }
};