const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema({
  farmerId:    { type: String, required: true },
  farmerName:  { type: String, required: true },
  farmerPhone: { type: String, required: true },
  village:     { type: String, required: true },
  district:    { type: String, default: '' },
  state:       { type: String, required: true },
  cropName:    { type: String, required: true },
  quantity:    { type: Number, required: true },       // in Quintals
  unit:        { type: String, default: 'Quintal' },
  pricePerUnit:{ type: Number, required: true },       // ₹ per Quintal
  quality:     { type: String, default: 'Good' },      // Good / Premium / Fair
  description: { type: String, default: '' },
  harvestDate: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('CropListing', cropListingSchema);
