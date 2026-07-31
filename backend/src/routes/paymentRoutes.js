const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getPriceForIssue } = require('../config/pricing');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//post
// POST /api/payment/create-order — issueType ke hisaab se price nikaal ke Razorpay order banata hai
router.post('/create-order', async (req, res) => {
  try {
    const { issueType } = req.body;
    const amount = getPriceForIssue(issueType); // rupees mein

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay paise mein leta hai (1 rupee = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/verify — payment genuine hai ya nahi confirm karta hai
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Signature match nahi hui' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;