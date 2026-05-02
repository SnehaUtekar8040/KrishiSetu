const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ============================================================
// MongoDB Persistence
// ============================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krishisetu';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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

const Farmer = mongoose.model('Farmer', farmerSchema);

// ── Crop Listing Schema ──
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

const CropListing = mongoose.model('CropListing', cropListingSchema);


// Simple salted hash (upgrade to bcrypt in production)
const hash = (str) => Buffer.from(str + '_krishisetu_2026_salt').toString('base64');

// ──────────────────────────────────────────
// AUTH API
// ──────────────────────────────────────────

// ---- Farmer Registration ----
app.post('/api/auth/register', async (req, res) => {
  const { name, phone, village, district, state, password } = req.body;

  // Validate fields
  if (!name || !phone || !village || !state || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check for duplicate phone
    const existingFarmer = await Farmer.findOne({ phone: phone.trim() });
    if (existingFarmer) {
      return res.status(409).json({ error: 'This mobile number is already registered. Please sign in.' });
    }

    const newFarmer = new Farmer({
      id: `F${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      district: (district || '').trim(),
      state: state.trim(),
      passwordHash: hash(password)
    });

    await newFarmer.save();

    console.log(`✅ Registered: ${newFarmer.name} | +91 ${newFarmer.phone} | ${newFarmer.village}, ${newFarmer.district}, ${newFarmer.state}`);

    res.status(201).json({
      message: 'Account created successfully! You can now sign in.',
      farmer: {
        id: newFarmer.id,
        name: newFarmer.name,
        phone: newFarmer.phone,
        village: newFarmer.village,
        district: newFarmer.district,
        state: newFarmer.state,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ---- Farmer Login ----
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone number and password are required.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });
  }

  try {
    const farmer = await Farmer.findOne({
      phone: phone.trim(),
      passwordHash: hash(password)
    });

    if (!farmer) {
      return res.status(401).json({ error: 'Invalid phone number or password. Please try again.' });
    }

    // Generate a simple token (use jsonwebtoken in production)
    const tokenPayload = `${farmer.id}:${farmer.phone}:${Date.now()}`;
    const token = Buffer.from(tokenPayload).toString('base64');

    // Update last login timestamp
    farmer.lastLogin = new Date().toISOString();
    await farmer.save();

    console.log(`🔓 Login: ${farmer.name} | +91 ${farmer.phone}`);

    res.status(200).json({
      token,
      user: {
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        village: farmer.village,
        district: farmer.district || '',
        state: farmer.state,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ---- Get All Registered Farmers (admin view) ----
app.get('/api/auth/farmers', async (req, res) => {
  try {
    const farmers = await Farmer.find({}, 'id name phone village state createdAt lastLogin');
    res.json({ count: farmers.length, farmers });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch farmers' });
  }
});

// ──────────────────────────────────────────
// WEATHER API
// Geocodes village name → Open-Meteo forecast (free, no key)
// Falls back to Nominatim (OpenStreetMap) for small Indian villages
// ──────────────────────────────────────────
app.get('/api/weather', async (req, res) => {
  const { village, district, state } = req.query;
  if (!village) return res.status(400).json({ error: 'village is required' });

  // ── WMO weather code → label + icon ──
  const codeInfo = (code) => {
    if (code === 0)  return { desc: 'Clear Sky',    icon: '\u2600\uFE0F'  };
    if (code <= 2)   return { desc: 'Mainly Clear', icon: '\uD83C\uDF24\uFE0F' };
    if (code === 3)  return { desc: 'Overcast',     icon: '\u2601\uFE0F'  };
    if (code <= 48)  return { desc: 'Foggy',        icon: '\uD83C\uDF2B\uFE0F' };
    if (code <= 57)  return { desc: 'Drizzle',      icon: '\uD83C\uDF26\uFE0F' };
    if (code <= 67)  return { desc: 'Rain',         icon: '\uD83C\uDF27\uFE0F' };
    if (code <= 77)  return { desc: 'Snow',         icon: '\u2744\uFE0F'  };
    if (code <= 82)  return { desc: 'Rain Showers', icon: '\uD83C\uDF26\uFE0F' };
    if (code <= 86)  return { desc: 'Snow Showers', icon: '\uD83C\uDF28\uFE0F' };
    if (code >= 95)  return { desc: 'Thunderstorm', icon: '\u26C8\uFE0F'  };
    return { desc: 'Clear', icon: '\u2600\uFE0F' };
  };

  // ── Geocoding: 3-strategy fallback ───────────────────────────
  let latitude, longitude, resolvedName, resolvedState;

  // Strategy A: Open-Meteo geocoding — village + district + state for precision
  if (!latitude) {
    try {
      // Build query: "Karjat, Raigad, Maharashtra" gives best results
      const parts = [village.trim()];
      if (district && district.trim()) parts.push(district.trim());
      if (state && state.trim()) parts.push(state.trim());
      const q = encodeURIComponent(parts.join(', '));
      const r = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=10&language=en&format=json`
      );
      const results = r.data.results || [];
      const hit = results.find(h => h.country_code === 'IN') || results[0];
      if (hit) {
        ({ latitude, longitude } = hit);
        resolvedName = hit.name;
        resolvedState = hit.admin1;
        console.log(`[Weather] Open-Meteo: ${resolvedName}, ${resolvedState}`);
      }
    } catch (e) { console.warn('Open-Meteo geocoding failed:', e.message); }
  }

  // Strategy B: Nominatim — village + district + state (precise Indian lookup)
  if (!latitude) {
    try {
      const parts = [village.trim()];
      if (district && district.trim()) parts.push(district.trim());
      parts.push(state || 'India');
      const q = encodeURIComponent(parts.join(', '));
      const r = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=in`,
        { headers: { 'User-Agent': 'KrishiSetu-FarmApp/1.0' } }
      );
      const results = r.data || [];
      if (results.length > 0) {
        latitude = parseFloat(results[0].lat);
        longitude = parseFloat(results[0].lon);
        const parts2 = (results[0].display_name || '').split(',');
        resolvedName = parts2[0]?.trim() || village;
        resolvedState = state || 'India';
        console.log(`[Weather] Nominatim: ${resolvedName}, ${resolvedState}`);
      }
    } catch (e) { console.warn('Nominatim geocoding failed:', e.message); }
  }

  // Strategy C: Nominatim with just village + India (broadest search)
  if (!latitude) {
    try {
      const q = encodeURIComponent(`${village.trim()} India`);
      const r = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5`,
        { headers: { 'User-Agent': 'KrishiSetu-FarmApp/1.0' } }
      );
      const results = r.data || [];
      if (results.length > 0) {
        latitude = parseFloat(results[0].lat);
        longitude = parseFloat(results[0].lon);
        const parts = (results[0].display_name || '').split(',');
        resolvedName = parts[0]?.trim() || village;
        resolvedState = state || 'India';
        console.log(`[Weather] Nominatim fallback: ${resolvedName}`);
      }
    } catch (e) { console.warn('Nominatim fallback failed:', e.message); }
  }

  if (!latitude || !longitude) {
    return res.status(404).json({
      error: `Could not find location "${village}". Please check the spelling.`
    });
  }

  // ── Step 2: Fetch 7-day forecast from Open-Meteo ─────────────
  try {
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max` +
      `&hourly=relativehumidity_2m,precipitation_probability,temperature_2m,weathercode` +
      `&timezone=Asia%2FKolkata` +
      `&forecast_days=7`
    );

    const data = weatherRes.data;
    const cw = data.current_weather;
    const currentInfo = codeInfo(cw.weathercode);

    // Find the correct hourly index for current IST time
    // Open-Meteo hourly timestamps are in IST (since we set timezone=Asia/Kolkata)
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentHourIST = nowIST.getHours();
    // Today's hourly data starts at index 0 (midnight IST) → index = current hour
    const humidityIdx = Math.min(currentHourIST, (data.hourly?.relativehumidity_2m?.length || 24) - 1);
    const humidity = data.hourly?.relativehumidity_2m?.[humidityIdx] ?? '--';

    // Helper: get the dominant weather code during daytime hours (9am–3pm)
    // for a given day offset (0=today, 1=tomorrow, etc.)
    const getDaytimeCode = (dayOffset) => {
      // hours for this day: dayOffset*24 + 9  to  dayOffset*24 + 15
      const start = dayOffset * 24 + 9;
      const end   = dayOffset * 24 + 15;
      const codes = (data.hourly?.weathercode || []).slice(start, end + 1);
      if (!codes.length) return null;
      // Most frequently occurring code wins (mode)
      const freq = {};
      codes.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
      return parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
    };

    const daily = data.daily;
    const forecast = daily.time.map((date, i) => {
      let weatherCode;
      if (i === 0) {
        // TODAY → use the live current_weather code (what it's doing RIGHT NOW)
        weatherCode = cw.weathercode;
      } else if (i === 1) {
        // TOMORROW → use dominant daytime (9am-3pm) code instead of worst-case
        weatherCode = getDaytimeCode(1) ?? daily.weathercode[i];
      } else {
        // Future days → use dominant daytime code, fallback to daily
        weatherCode = getDaytimeCode(i) ?? daily.weathercode[i];
      }
      return {
        date,
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        rainMm:   daily.precipitation_sum[i] ?? 0,
        rainProb: daily.precipitation_probability_max[i] ?? 0,
        windspeed: Math.round(daily.windspeed_10m_max[i]),
        ...codeInfo(weatherCode),
      };
    });

    const tomorrow = forecast[1];
    const rainAlert = tomorrow && (tomorrow.rainProb >= 50 || tomorrow.rainMm >= 5);

    res.json({
      location: { name: resolvedName, state: resolvedState, latitude, longitude },
      current: {
        temp: Math.round(cw.temperature),
        desc: currentInfo.desc,
        icon: currentInfo.icon,
        wind: Math.round(cw.windspeed),
        humidity,
      },
      forecast,
      rainAlert,
      tomorrowRain: tomorrow
        ? { prob: tomorrow.rainProb, mm: tomorrow.rainMm, icon: tomorrow.icon, desc: tomorrow.desc }
        : null,
    });
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

// ──────────────────────────────────────────
// MANDI PRICES
// Proxies data.gov.in Agmarknet API, filtered by state
// GET /api/mandi-prices?state=Maharashtra&crop=Rice&limit=50
// ──────────────────────────────────────────
app.get('/api/mandi-prices', async (req, res) => {
  const { state, crop, limit = 100 } = req.query;
  const MANDI_API_KEY = process.env.MANDI_API_KEY;

  if (!MANDI_API_KEY) {
    return res.status(500).json({ error: 'Mandi API key not configured on server.' });
  }
  if (!state) {
    return res.status(400).json({ error: 'state query parameter is required.' });
  }

  try {
    // ⚠️ IMPORTANT: data.gov.in requires LITERAL brackets in filter params.
    // URLSearchParams encodes [ ] → %5B %5D which the API silently ignores.
    // We must build the URL string manually to keep literal brackets.
    const stateName = state.trim();
    const cropName  = crop ? crop.trim() : '';
    const fetchLimit = Math.min(Number(limit) || 100, 500);

    let url =
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
      `?api-key=${encodeURIComponent(MANDI_API_KEY)}` +
      `&format=json` +
      `&limit=${fetchLimit}` +
      `&offset=0` +
      `&filters[state.keyword]=${encodeURIComponent(stateName)}`;

    if (cropName) {
      url += `&filters[commodity]=${encodeURIComponent(cropName)}`;
    }

    console.log(`[Mandi] Fetching → state="${stateName}" crop="${cropName || 'all'}" limit=${fetchLimit}`);

    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;

    if (!data || !Array.isArray(data.records)) {
      return res.status(502).json({ error: 'Unexpected response from Mandi API.' });
    }

    // Normalise fields
    const records = data.records.map(r => ({
      state:        r.state         || '',
      district:     r.district      || '',
      market:       r.market        || '',
      commodity:    r.commodity     || '',
      variety:      r.variety       || '',
      grade:        r.grade         || '',
      arrival_date: r.arrival_date  || '',
      min_price:    Number(r.min_price)   || 0,
      max_price:    Number(r.max_price)   || 0,
      modal_price:  Number(r.modal_price) || 0,
    }));

    // Sort: newest arrival_date first, then highest modal_price
    records.sort((a, b) => {
      // arrival_date format: DD/MM/YYYY → convert to YYYY-MM-DD for comparison
      const toISO = d => d.split('/').reverse().join('-');
      const cmp = toISO(b.arrival_date || '00/00/0000').localeCompare(toISO(a.arrival_date || '00/00/0000'));
      return cmp !== 0 ? cmp : b.modal_price - a.modal_price;
    });

    console.log(`[Mandi] ✅ Returned ${records.length} records (API total: ${data.total})`);

    res.json({
      state: stateName,
      total: data.total || records.length,
      returned: records.length,
      records,
    });

  } catch (err) {
    const status = err.response?.status;
    if (status === 403) {
      return res.status(403).json({ error: 'Mandi API access denied. Check your API key.' });
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Mandi API timed out. Please try again.' });
    }
    console.error('[Mandi] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch mandi prices. Please try again.' });
  }
});

// ──────────────────────────────────────────
// CROP PREDICTION
// Proxies to the FastAPI ML service
// ──────────────────────────────────────────
app.post('/api/predict', async (req, res) => {
  console.log('🌾 Prediction request received');
  try {
    const predictionResponse = await axios.post('http://localhost:8001/predict', req.body);
    console.log('✅ Prediction result:', predictionResponse.data);
    res.status(200).json(predictionResponse.data);
  } catch (error) {
    console.error('❌ Prediction error:', error.message);
    res.status(500).json({ error: 'Failed to get prediction. Make sure the AI service is running.' });
  }
});

// ──────────────────────────────────────────
// AI CHATBOT
// Calls Groq API (LLaMA 3.3 70B)
// ──────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  console.log('💬 Chat message:', req.body.message);
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
    console.log('✅ Chat reply generated');
    res.status(200).json({ reply });
  } catch (error) {
    console.error('❌ Chat error:', error.response?.data || error.message);
    res.status(500).json({
      reply: 'Sorry, I could not process your message right now. Please try again later.',
    });
  }
});

// ──────────────────────────────────────────
// CROP MARKETPLACE
// ──────────────────────────────────────────

// POST /api/listings — create a new crop listing
app.post('/api/listings', async (req, res) => {
  const { farmerId, farmerName, farmerPhone, village, district, state,
          cropName, quantity, pricePerUnit, quality, description, harvestDate } = req.body;

  if (!farmerId || !farmerName || !farmerPhone || !village || !state ||
      !cropName || !quantity || !pricePerUnit) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (Number(quantity) <= 0 || Number(pricePerUnit) <= 0) {
    return res.status(400).json({ error: 'Quantity and price must be positive numbers.' });
  }

  try {
    const listing = new CropListing({
      farmerId, farmerName, farmerPhone,
      village, district: district || '', state,
      cropName: cropName.trim(),
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      quality: quality || 'Good',
      description: description || '',
      harvestDate: harvestDate || '',
    });
    await listing.save();
    console.log(`🌾 New listing: ${listing.cropName} by ${listing.farmerName}`);
    res.status(201).json({ message: 'Listing posted successfully!', listing });
  } catch (err) {
    console.error('Listing error:', err);
    res.status(500).json({ error: 'Failed to create listing.' });
  }
});

// GET /api/listings — browse all available listings (with optional filters)
app.get('/api/listings', async (req, res) => {
  const { state, crop, quality, farmerId, limit = 50, skip = 0 } = req.query;

  const filter = { isAvailable: true };
  if (state)   filter.state    = { $regex: state.trim(), $options: 'i' };
  if (crop)    filter.cropName = { $regex: crop.trim(),  $options: 'i' };
  if (quality) filter.quality  = quality.trim();
  if (farmerId) { delete filter.isAvailable; filter.farmerId = farmerId; }

  try {
    const total    = await CropListing.countDocuments(filter);
    const listings = await CropListing
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ total, listings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// DELETE /api/listings/:id — remove listing (only by the farmer who created it)
app.delete('/api/listings/:id', async (req, res) => {
  const { farmerId } = req.body;
  if (!farmerId) return res.status(400).json({ error: 'farmerId required.' });

  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.farmerId !== farmerId) return res.status(403).json({ error: 'Not authorized.' });

    await listing.deleteOne();
    res.json({ message: 'Listing removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

// ──────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const count = await Farmer.countDocuments();
    res.json({
      status: 'ok',
      service: 'KrishiSetu Backend',
      farmersRegistered: count,
      database: 'MongoDB',
      uptime: Math.floor(process.uptime()) + 's',
    });
  } catch (err) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// ──────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 KrishiSetu Backend running on http://localhost:${PORT}`);
});
