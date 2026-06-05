const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  village: { type: String, required: true },
  district: { type: String, default: '' },
  state: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  lastLogin: { type: String }
});

module.exports = mongoose.model('Farmer', farmerSchema);
