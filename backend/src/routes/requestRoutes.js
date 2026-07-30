const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { emitRequestStatus, emitNewRequestToHelpers, emitRequestTaken } = require('../../sockets');
const crypto = require('crypto');

// GET /pending/:helperId — is helper ke candidate list mein hai, abhi tak reject nahi kiya, aur koi aur le nahi gaya
router.get('/pending/:helperId', async (req, res) => {
  try {
    const requests = await Request.find({
      candidateHelperIds: req.params.helperId,
      rejectedBy: { $ne: req.params.helperId },
      status: 'pending',
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:requestId/accept — RACE-CONDITION SAFE: sirf pehla helper jeetega
router.post('/:requestId/accept', async (req, res) => {
  try {
    const { helperId } = req.body;

    if (!helperId) {
      return res.status(400).json({ error: 'helperId zaroori hai' });
    }

    // 👇 Atomic update — sirf tab update hoga jab status abhi bhi "pending" ho
    // Agar kisi aur helper ne isi second mein accept kar liya, to ye query
    // koi document match nahi karegi (kyunki status ab "accepted" ho chuka hoga)
    const updated = await Request.findOneAndUpdate(
      { _id: req.params.requestId, status: 'pending' },
      { status: 'accepted', helperId },
      { new: true }
    );

    if (!updated) {
      // Iska matlab koi aur helper pehle hi le chuka hai
      return res.status(409).json({ error: 'Ye request already kisi aur helper ne le li hai' });
    }

    // User ki tracking screen ko turant batao
    emitRequestStatus(req.params.requestId, 'accepted');

    // Baaki candidate helpers ko batao ki ye request ab available nahi hai
    const otherHelperIds = updated.candidateHelperIds.filter(
      (id) => id.toString() !== helperId.toString()
    );
    emitRequestTaken(otherHelperIds, req.params.requestId);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:requestId/reject — is helper ko iski list se hatao, baaki logo ko dikhta rahega
router.post('/:requestId/reject', async (req, res) => {
  try {
    const { helperId } = req.body;

    if (!helperId) {
      return res.status(400).json({ error: 'helperId zaroori hai' });
    }

    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { $addToSet: { rejectedBy: helperId } }, // duplicate add nahi hoga
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /create — ab single helperId ki jagah candidateHelperIds (top 10) leta hai
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      candidateHelperIds,
      issueType,
      userLocation,
      matchScore,
      matchBreakdown,
      estimatedArrivalMin,
      amount,
      paymentId,
      orderId,
      paymentStatus,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId zaroori hai' });
    }
    if (!candidateHelperIds || candidateHelperIds.length === 0) {
      return res.status(400).json({ error: 'candidateHelperIds zaroori hai' });
    }

    const newRequest = new Request({
      userId,
      candidateHelperIds,
      issueType,
      userLocation,
      status: 'pending',
      matchScore,
      matchBreakdown,
      estimatedArrivalMin,
      amount,
      paymentId,
      orderId,
      paymentStatus,
    });

    await newRequest.save();

    // 👇 NAYA: sabhi 10 candidate helpers ko turant notification bhejo (polling ka wait nahi karna)
    emitNewRequestToHelpers(candidateHelperIds, newRequest);

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /user/:userId — us user ki saari requests (history ke liye)
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.userId })
      .populate('helperId', 'name vehicleType vehicleNumber rating')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👇 NAYA: GET /helper/:helperId — us helper ki saari requests (Helper History tab ke liye)
router.get('/helper/:helperId', async (req, res) => {
  try {
    const requests = await Request.find({ helperId: req.params.helperId })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ek specific request ka current status check karne ke liye
// ⚠️ Ye route hamesha /user/:userId aur /helper/:helperId ke NEECHE hona chahiye,
// warna Express in dono ko bhi galti se ":requestId" samajh lega
router.get('/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId)
      .populate('helperId', 'name phone vehicleType vehicleNumber rating');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper OTP verify karke job complete karta hai
router.post('/:requestId/complete', async (req, res) => {
  try {
    const { otp } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.otp !== otp) {
      return res.status(400).json({ error: 'OTP galat hai' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    emitRequestStatus(req.params.requestId, 'completed');

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:requestId/pay — job complete hone ke baad payment verify karke request update karta hai
// Signature yahi backend par verify hoti hai — client ke "paid" claim par bharosa nahi karte
router.post('/:requestId/pay', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details incomplete hain' });
    }

    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Job abhi complete nahi hua hai, payment nahi le sakte' });
    }
    if (request.paymentStatus === 'paid') {
      return res.json(request); // idempotent — dobara call hua to error mat do
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature match nahi hui' });
    }

    request.paymentId = razorpay_payment_id;
    request.orderId = razorpay_order_id;
    request.amount = amount || request.amount;
    request.paymentStatus = 'paid';
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:requestId/rate — user helper ko rating deta hai
router.post('/:requestId/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating 1 se 5 ke beech honi chahiye' });
    }

    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { userRating: rating },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;