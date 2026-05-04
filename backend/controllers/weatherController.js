const axios = require('axios');

const codeInfo = (code) => {
  if (code === 0)  return { desc: 'Clear Sky',    icon: '☀️'  };
  if (code <= 2)   return { desc: 'Mainly Clear', icon: '🌤️' };
  if (code === 3)  return { desc: 'Overcast',     icon: '☁️'  };
  if (code <= 48)  return { desc: 'Foggy',        icon: '🌫️' };
  if (code <= 57)  return { desc: 'Drizzle',      icon: '🌦️' };
  if (code <= 67)  return { desc: 'Rain',         icon: '🌧️' };
  if (code <= 77)  return { desc: 'Snow',         icon: '❄️'  };
  if (code <= 82)  return { desc: 'Rain Showers', icon: '🌦️' };
  if (code <= 86)  return { desc: 'Snow Showers', icon: '🌨️' };
  if (code >= 95)  return { desc: 'Thunderstorm', icon: '⛈️'  };
  return { desc: 'Clear', icon: '☀️' };
};

exports.getWeather = async (req, res) => {
  const { village, district, state } = req.query;
  if (!village) return res.status(400).json({ error: 'village is required' });

  let latitude, longitude, resolvedName, resolvedState;

  // Strategy A: Open-Meteo geocoding
  try {
    const parts = [village.trim()];
    if (district && district.trim()) parts.push(district.trim());
    if (state && state.trim()) parts.push(state.trim());
    const q = encodeURIComponent(parts.join(', '));
    const r = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=10&language=en&format=json`);
    const results = r.data.results || [];
    const hit = results.find(h => h.country_code === 'IN') || results[0];
    if (hit) {
      ({ latitude, longitude } = hit);
      resolvedName = hit.name;
      resolvedState = hit.admin1;
    }
  } catch (e) { console.warn('Open-Meteo geocoding failed'); }

  // Strategy B: Nominatim
  if (!latitude) {
    try {
      const parts = [village.trim()];
      if (district && district.trim()) parts.push(district.trim());
      parts.push(state || 'India');
      const q = encodeURIComponent(parts.join(', '));
      const r = await axios.get(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=in`, { headers: { 'User-Agent': 'KrishiSetu-FarmApp/1.0' } });
      const results = r.data || [];
      if (results.length > 0) {
        latitude = parseFloat(results[0].lat);
        longitude = parseFloat(results[0].lon);
        const parts2 = (results[0].display_name || '').split(',');
        resolvedName = parts2[0]?.trim() || village;
        resolvedState = state || 'India';
      }
    } catch (e) { console.warn('Nominatim geocoding failed'); }
  }

  if (!latitude || !longitude) {
    return res.status(404).json({ error: `Could not find location "${village}". Please check the spelling.` });
  }

  try {
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max&hourly=relativehumidity_2m,precipitation_probability,temperature_2m,weathercode&timezone=Asia%2FKolkata&forecast_days=7`
    );

    const data = weatherRes.data;
    const cw = data.current_weather;
    const currentInfo = codeInfo(cw.weathercode);

    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const humidityIdx = Math.min(nowIST.getHours(), (data.hourly?.relativehumidity_2m?.length || 24) - 1);
    const humidity = data.hourly?.relativehumidity_2m?.[humidityIdx] ?? '--';

    const getDaytimeCode = (dayOffset) => {
      const start = dayOffset * 24 + 9;
      const end   = dayOffset * 24 + 15;
      const codes = (data.hourly?.weathercode || []).slice(start, end + 1);
      if (!codes.length) return null;
      const freq = {};
      codes.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
      return parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
    };

    const daily = data.daily;
    const forecast = daily.time.map((date, i) => {
      let weatherCode = i === 0 ? cw.weathercode : (getDaytimeCode(i) ?? daily.weathercode[i]);
      return {
        date,
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        rainMm: daily.precipitation_sum[i] ?? 0,
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
      tomorrowRain: tomorrow ? { prob: tomorrow.rainProb, mm: tomorrow.rainMm, icon: tomorrow.icon, desc: tomorrow.desc } : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
};
