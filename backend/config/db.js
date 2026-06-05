const mongoose = require('mongoose');
const dns = require('dns');

// Fix for querySrv ECONNREFUSED when connecting to MongoDB Atlas on certain Windows environments
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krishisetu';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
