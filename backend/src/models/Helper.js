const mongoose = require('mongoose');

const helperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  skillTypes: {
    type: [String],
    enum: ['petrol', 'mechanic', 'tyre', 'battery', 'tow'],
    required: true,
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  successRate: {
    type: Number,
    default: 0.8,
    min: 0,
    max: 1,
  },
  totalJobsCompleted: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

helperSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Helper', helperSchema);