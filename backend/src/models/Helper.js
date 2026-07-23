const mongoose = require('mongoose');

// This defines what one "helper" (mechanic/delivery person) looks like in the database
const helperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicle: { type: String, required: true },       // e.g. "Bajaj Pulsar"
  plateNumber: { type: String, required: true },   // e.g. "MP09 XX 4521"
  skills: {
    type: [String],                                 // e.g. ["fuel", "mechanic", "towing"]
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  successRate: { type: Number, default: 80, min: 0, max: 100 }, // % of past jobs completed
  isAvailable: { type: Boolean, default: true },
  lastActiveAt: { type: Date, default: Date.now }    // used to calculate "availability score"
}, { timestamps: true });

module.exports = mongoose.model('Helper', helperSchema);
