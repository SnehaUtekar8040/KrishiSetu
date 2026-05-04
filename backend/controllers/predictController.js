const axios = require('axios');

exports.predict = async (req, res) => {
  try {
    const predictionResponse = await axios.post('http://localhost:8001/predict', req.body);
    res.status(200).json(predictionResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get prediction. Make sure the AI service is running.' });
  }
};
