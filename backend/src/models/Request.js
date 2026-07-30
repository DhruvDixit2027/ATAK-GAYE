const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
    default: null, // null until AI assigns a helper
  },
  // 👇 NAYA: Broadcast model ke liye — top 10 nearby helpers jinko request bheji gayi
  candidateHelperIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
  }],
  // Jin helpers ne reject kiya — unki list se ye request hat jaati hai
  rejectedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
  }],
  issueType: {
    type: String,
    enum: ['petrol', 'mechanic', 'tyre', 'battery', 'tow'],
    required: true,
  },
  userLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  // AI matching output — stored so the app can show "why this helper was chosen"
  matchScore: {
    type: Number,
    default: null,
  },
  matchBreakdown: {
    distanceScore: Number,
    ratingScore: Number,
    availabilityScore: Number,
    skillScore: Number,
    successScore: Number,
  },
  estimatedArrivalMin: {
    type: Number,
    default: null,
  },
  otp: {
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString(),
  },
  amount: {
    type: Number,
    default: null,
  },
  paymentId: {
    type: String,
    default: null,
  },
  orderId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Request', requestSchema);