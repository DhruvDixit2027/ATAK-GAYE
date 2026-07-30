const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Helper = require('../models/Helper'); // NAYA: job count increment karne ke liye
const { emitRequestStatus } = require('../../sockets');

router.get('/pending/:helperId', async (req, res) => {
  try {
    const requests = await Request.find({
      helperId: req.params.helperId,
      status: 'pending',
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:requestId/accept', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status: 'accepted' },
      { new: true }
    );
    emitRequestStatus(req.params.requestId, 'accepted');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:requestId/reject', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status: 'rejected' },
      { new: true }
    );
    emitRequestStatus(req.params.requestId, 'rejected');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      helperId,
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

    const newRequest = new Request({
      userId,
      helperId,
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
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// NAYA: GET /api/requests/helper/:helperId — helper ki poori job history
// (accepted, completed, rejected sab) — History tab isko use karega
router.get('/helper/:helperId', async (req, res) => {
  try {
    const requests = await Request.find({
      helperId: req.params.helperId,
      status: { $in: ['accepted', 'in-progress', 'completed', 'rejected'] },
    })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    // NAYA: helper ke totalJobsCompleted counter ko +1 karo
    if (request.helperId) {
      await Helper.findByIdAndUpdate(request.helperId, { $inc: { totalJobsCompleted: 1 } });
    }

    emitRequestStatus(req.params.requestId, 'completed');

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;