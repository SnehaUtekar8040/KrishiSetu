const axios = require('axios');

exports.chat = async (req, res) => {
  const API_KEY = process.env.GROQ_API_KEY;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are KrishiSetu AI, a knowledgeable and friendly farming assistant for Indian farmers.
You help with:
- Crop selection and recommendation based on soil and climate
- Soil health and nutrient management (NPK, pH, organic carbon)
- Irrigation and water management techniques
- Pest and disease identification and organic control methods
- Modern & traditional farming techniques
- Seasonal planting guides for Indian regions
- Government schemes and subsidies for farmers

Always be helpful, practical, and give advice suitable for Indian agricultural conditions.
Keep responses concise (2-3 paragraphs max) and use simple language.
Use relevant emojis to make responses engaging. 🌱🌾🚜`,
          },
          { role: 'user', content: req.body.message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: 'Sorry, I could not process your message right now.' });
  }
};
