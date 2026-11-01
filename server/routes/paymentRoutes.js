import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

// Prices live on the server so the browser can never choose its own price
const PLANS = {
  monthly: { amount: 14900, days: 30 },   // ₹149 (in paise)
  yearly: { amount: 149900, days: 365 },  // ₹1499
};

router.post('/create-order', protect, async (req, res) => {
  try {
    const plan = PLANS[req.body.billing];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    // Created inside the handler so missing keys can't crash the server on startup
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    await Payment.create({
      user: req.user._id,
      orderId: order.id,
      billing: req.body.billing,
      amount: plan.amount,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.error?.description || err.message });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Razorpay signs "orderId|paymentId" with your secret; recompute and compare
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id, user: req.user._id });
    if (!payment) return res.status(404).json({ error: 'Order not found' });

    const user = await User.findById(req.user._id);

    if (payment.status !== 'paid') {
      payment.status = 'paid';
      payment.paymentId = razorpay_payment_id;
      await payment.save();

      const now = new Date();
      const current = user.subscription?.endDate;
      const base = current && current > now ? current : now; // renewing extends instead of resetting
      const days = PLANS[payment.billing].days;

      user.subscription = {
        plan: 'premium',
        billing: payment.billing,
        startDate: now,
        endDate: new Date(base.getTime() + days * 24 * 60 * 60 * 1000),
      };
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      subscription: user.subscription,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;