const express = require('express');
const router = express.Router();
const User = require('../models/User');

// TESTING MODE: OTP yahan memory mein store ho raha hai (server restart hone
// pe clear ho jaayega). Real SMS provider (Twilio/MSG91) add karne ke baad
// isko database ya Redis mein move karna better hoga.
const otpStore = new Map(); // phone -> { otp, expiresAt }

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minute

// POST /api/auth/send-otp — phone pe OTP "bhejta" hai
router.post('/send-otp', (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ error: 'Sahi phone number daalo' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(phone, { otp, expiresAt });

    // Dev/testing ke liye terminal mein bhi print kar do
    console.log(`📱 OTP for ${phone}: ${otp}`);

    // ⚠️ TESTING MODE: OTP response mein wapas bhej rahe hain taaki
    // screen pe dikha sako bina real SMS service ke. Jab real SMS
    // (Twilio/MSG91) integrate karo, to "otp" field yahan se HATA dena —
    // warna koi bhi OTP dekh sakta hai response mein.
    res.json({
      message: 'OTP bhej diya (testing mode)',
      otp, // 👈 sirf testing ke liye
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp — OTP match karta hai, aur batata hai
// ki user already registered hai ya naya hai
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone aur OTP dono zaroori hai' });
    }

    const record = otpStore.get(phone);

    if (!record) {
      return res.status(400).json({ error: 'Pehle OTP bhejo' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP expire ho gaya, dobara bhejo' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'OTP galat hai' });
    }

    // OTP sahi hai — ab isko dobara use hone se roko
    otpStore.delete(phone);

    const existingUser = await User.findOne({ phone });

    res.json({
      valid: true,
      exists: !!existingUser,
      user: existingUser || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;