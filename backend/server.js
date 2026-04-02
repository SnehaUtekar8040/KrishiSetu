const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ---- Crop Prediction Endpoint ----
// Proxies to the FastAPI prediction service
app.post('/api/predict', async (req, res) => {
    console.log('Backend: Received prediction request');
    
    try {
        const predictionResponse = await axios.post('http://localhost:8000/predict', req.body);
        console.log('Backend: Prediction result:', predictionResponse.data);
        res.status(200).json(predictionResponse.data);
    } catch (error) {
        console.error('Backend: Prediction error:', error.message);
        res.status(500).json({ error: 'Failed to get prediction. Make sure the AI service is running.' });
    }
});

// ---- Chatbot Endpoint ----
// Calls the Grok/Groq API directly
app.post('/api/chat', async (req, res) => {
    console.log('Backend: Received chat message:', req.body.message);
    
    const API_KEY = process.env.GROQ_API_KEY 
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are KrishiMitra, a knowledgeable and friendly farming assistant for Indian farmers. 
You help with:
- Crop selection and recommendation based on soil and climate
- Soil health and nutrient management (NPK, pH, organic carbon)
- Irrigation and water management techniques
- Pest and disease identification and control
- Modern farming techniques and best practices
- Seasonal planting guides
- Organic farming methods

Always be helpful, practical, and give advice suitable for Indian agricultural conditions.
Keep responses concise (2-3 paragraphs max) and use simple language.
Use relevant emojis to make responses engaging. 🌱🌾`
                    },
                    { role: 'user', content: req.body.message }
                ],
                temperature: 0.7,
                max_tokens: 500,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = response.data.choices[0].message.content;
        console.log('Backend: Chat reply generated');
        res.status(200).json({ reply });
    } catch (error) {
        console.error('Backend: Chat error:', error.response?.data || error.message);
        res.status(500).json({ reply: 'Sorry, I could not process your message right now. Please try again later.' });
    }
});

// ---- Health Check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'KrishiMitra Backend' });
});

app.listen(PORT, () => {
    console.log(`✅ KrishiMitra Backend running on http://localhost:${PORT}`);
});
