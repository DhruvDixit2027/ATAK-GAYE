require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Helper = require('./models/Helper');

// Sample data based on your NH-27 Lucknow bypass screenshots
const sampleHelpers = [
  {
    name: 'Ravi Kumar',
    vehicle: 'Bajaj Pulsar',
    plateNumber: 'MP09 XX 4521',
    skills: ['fuel', 'mechanic', 'towing'],
    location: { lat: 26.8600, lng: 80.9900 }, // ~1.2km from test point below
    rating: 4.8,
    successRate: 94,
    isAvailable: true
  },
  {
    name: 'Imran Ali',
    vehicle: 'TVS Star City',
    plateNumber: 'UP32 CD 1189',
    skills: ['fuel', 'puncture'],
    location: { lat: 26.8580, lng: 80.9850 },
    rating: 4.2,
    successRate: 80,
    isAvailable: true
  },
  {
    name: 'Sanjay Yadav',
    vehicle: 'Hero Splendor',
    plateNumber: 'UP32 AB 7710',
    skills: ['mechanic', 'puncture'],
    location: { lat: 26.8700, lng: 80.9700 },
    rating: 4.5,
    successRate: 88,
    isAvailable: true
  },
  {
    name: 'Deepak Singh',
    vehicle: 'Bajaj CT100',
    plateNumber: 'UP32 XY 4402',
    skills: ['fuel', 'mechanic'],
    location: { lat: 26.8800, lng: 80.9600 },
    rating: 4.9,
    successRate: 90,
    isAvailable: true
  }
];

async function seed() {
  await connectDB();
  await Helper.deleteMany({}); // clear old test data
  await Helper.insertMany(sampleHelpers);
  console.log('✅ Sample helpers added!');
  mongoose.connection.close();
}

seed();
