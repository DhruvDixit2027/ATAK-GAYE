const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

const otpStore = new Map(); // phone -> { otp, expiresAt }
const OTP_EXPIRY_MS = 5 * 60 * 1000;

// 2Factor.in API se real SMS bhejta hai — inka pre-approved OTP template use hota hai,
// koi DLT registration ka wait nahi karna padta
async function sendSmsVia2Factor(phone, otp) {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}`;
  const response = await axios.get(url);
  return response.data;
}

router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ error: 'Sahi phone number daalo' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(phone, { otp, expiresAt });
    console.log(`📱 OTP for ${phone}: ${otp}`);

    try {
      await sendSmsVia2Factor(phone, otp);
    } catch (smsErr) {
      console.error('2Factor SMS error:', smsErr.response?.data || smsErr.message);
      return res.status(500).json({ error: 'SMS bhejne mein problem hui, dubara try karo' });
    }

    res.json({ message: 'OTP aapke phone pe bhej diya gaya hai' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone aur OTP dono zaroori hai' });
    }

    const record = otpStore.get(phone);
    if (!record) return res.status(400).json({ error: 'Pehle OTP bhejo' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP expire ho gaya, dobara bhejo' });
    }
    if (record.otp !== otp) return res.status(400).json({ error: 'OTP galat hai' });

    otpStore.delete(phone);
    const existingUser = await User.findOne({ phone });

    res.json({ valid: true, exists: !!existingUser, user: existingUser || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;