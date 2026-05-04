const axios = require('axios');
const TranslationCache = require('../models/TranslationCache');

const SUPPORTED_LANGS = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];

exports.translateBatch = async (req, res) => {
  const { texts, target_language } = req.body;

  if (!texts || !Array.isArray(texts) || !target_language) {
    return res.status(400).json({ error: 'texts array and target_language are required' });
  }

  if (!SUPPORTED_LANGS.includes(target_language)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const result = {};
  const missingTexts = [];

  try {
    const cachedTranslations = await TranslationCache.find({
      language: target_language,
      originalText: { $in: texts }
    });

    const cachedMap = {};
    cachedTranslations.forEach(doc => {
      cachedMap[doc.originalText] = doc.translatedText;
      result[doc.originalText] = doc.translatedText;
    });

    for (const text of texts) {
      if (!cachedMap[text]) {
        missingTexts.push(text);
      }
    }

    if (missingTexts.length > 0) {
      const newDocs = [];
      for (const text of missingTexts) {
        try {
          const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target_language}&dt=t&q=${encodeURIComponent(text)}`);
          let translatedText = '';
          if (response.data && response.data[0]) {
             response.data[0].forEach(part => { if (part[0]) translatedText += part[0]; });
          }
          const finalTranslated = translatedText || text;
          result[text] = finalTranslated;
          newDocs.push({ language: target_language, originalText: text, translatedText: finalTranslated });
        } catch (innerErr) {
          result[text] = text;
        }
      }

      if (newDocs.length > 0) {
        try {
          await TranslationCache.insertMany(newDocs, { ordered: false });
        } catch (dbErr) { }
      }
    }

    res.json({ translations: result });
  } catch (err) {
    texts.forEach(t => { if (!result[t]) result[t] = t; });
    res.json({ translations: result });
  }
};
