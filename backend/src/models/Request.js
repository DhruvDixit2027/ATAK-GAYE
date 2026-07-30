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