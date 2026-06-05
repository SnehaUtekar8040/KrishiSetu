const axios = require('axios');

exports.predict = async (req, res) => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
  try {
    const predictionResponse = await axios.post(`${AI_SERVICE_URL}/predict`, req.body);
    res.status(200).json(predictionResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get prediction. Make sure the AI service is running.' });
  }
};
