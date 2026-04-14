export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      // Update order to PAID
      await prisma.delivery.update({
        where: { paystackRef: reference },
        data: { status: 'PAID' },
      });

      return res.status(200).json({ status: 'success', message: 'Payment Verified!' });
    }

    res.status(400).json({ status: 'failed', message: 'Payment not confirmed yet' });
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
};