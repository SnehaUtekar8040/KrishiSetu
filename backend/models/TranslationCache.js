const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
});

// Create a compound index for fast lookups
translationSchema.index({ language: 1, originalText: 1 }, { unique: true });

module.exports = mongoose.model('TranslationCache', translationSchema);
