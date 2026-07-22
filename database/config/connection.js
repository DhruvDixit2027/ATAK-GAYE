const mongoose = require('mongoose');

// Reads MONGO_URI from a .env file — Person 2 (backend) will call this
// function once when the server starts up.
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/atakgaye';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', uri);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
