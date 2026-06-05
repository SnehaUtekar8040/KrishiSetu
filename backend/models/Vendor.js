const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  mandiLocation: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  lastLogin: { type: String }
});

module.exports = mongoose.model('Vendor', vendorSchema);
