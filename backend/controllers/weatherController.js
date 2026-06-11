const axios = require('axios');

// ── Map wttr.in weather codes to icons and descriptions ──────────────────────
// Using Unicode escape sequences to guarantee correct encoding
const codeInfo = (code) => {
  const c = parseInt(code, 10);
  if (c === 113) return { desc: 'Clear Sky',      icon: '\u2600\uFE0F'  };  // ☀️
  if (c === 116) return { desc: 'Partly Cloudy',  icon: '\uD83C\uDF24\uFE0F' }; // 🌤️
  if (c === 119) return { desc: 'Cloudy',         icon: '\u2601\uFE0F'  };  // ☁️
  if (c === 122) return { desc: 'Overcast',       icon: '\u2601\uFE0F'  };  // ☁️
  if (c === 143) return { desc: 'Foggy',          icon: '\uD83C\uDF2B\uFE0F' }; // 🌫️
  if ([176, 293, 296, 299, 302, 305, 308].includes(c)) return { desc: 'Rain',         icon: '\uD83C\uDF27\uFE0F' }; // 🌧️
  if ([179, 323, 326, 329, 332, 335, 338].includes(c)) return { desc: 'Snow',         icon: '\u2744\uFE0F'  };     // ❄️
  if ([185, 281, 284].includes(c))                     return { desc: 'Drizzle',      icon: '\uD83C\uDF26\uFE0F' }; // 🌦️
  if ([200, 386, 389, 392, 395].includes(c))           return { desc: 'Thunderstorm', icon: '\u26C8\uFE0F'  };     // ⛈️
  if ([260, 263, 266].includes(c))                     return { desc: 'Drizzle',      icon: '\uD83C\uDF26\uFE0F' }; // 🌦️
  if ([311, 314, 317, 320].includes(c))                return { desc: 'Rain Showers', icon: '\uD83C\uDF26\uFE0F' }; // 🌦️
  if ([227, 230].includes(c))                          return { desc: 'Blizzard',     icon: '\uD83C\uDF28\uFE0F' }; // 🌨️
  if (c === 248)                                       return { desc: 'Foggy',        icon: '\uD83C\uDF2B\uFE0F' }; // 🌫️
  return { desc: 'Cloudy', icon: '\uD83C\uDF25\uFE0F' }; // 🌥️
};

exports.getWeather = async (req, res) => {
  const { village, district, state } = req.query;
  if (!village) return res.status(400).json({ error: 'village is required' });

  // Build a location query that wttr.in can resolve
  const parts = [village.trim()];
  if (district && district.trim()) parts.push(district.trim());
  if (state && state.trim()) parts.push(state.trim());
  const locationQuery = parts.join(', ');

  try {
    // wttr.in returns current weather + 3-day forecast with hourly breakdown
    // format=j1 gives structured JSON, no API key needed
    const url = `https://wttr.in/${encodeURIComponent(locationQuery)}?format=j1`;
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'KrishiSetu-FarmApp/1.0' },
      responseType: 'json',
    });

    const data = response.data;

    // ── Nearest area / location info ─────────────────────────────────────────
    const nearest = data.nearest_area && data.nearest_area[0];
    const resolvedName  = (nearest && nearest.areaName  && nearest.areaName[0]  && nearest.areaName[0].value)  || village;
    const resolvedState = (nearest && nearest.region     && nearest.region[0]     && nearest.region[0].value)    || state || 'India';

    // ── Current weather ───────────────────────────────────────────────────────
    const cur = data.current_condition && data.current_condition[0];
    const currentCode = (cur && cur.weatherCode) || '113';
    const currentInfo = codeInfo(currentCode);
    const currentDesc = (cur && cur.weatherDesc && cur.weatherDesc[0] && cur.weatherDesc[0].value) || currentInfo.desc;

    const current = {
      temp:     parseInt((cur && cur.temp_C) || '0', 10),
      desc:     currentDesc,
      icon:     currentInfo.icon,
      wind:     parseInt((cur && cur.windspeedKmph) || '0', 10),
      humidity: parseInt((cur && cur.humidity) || '0', 10),
    };

    // ── 3-Day forecast (wttr.in gives exactly 3 days) ────────────────────────
    const weather3 = data.weather || [];

    const forecast = weather3.map((day) => {
      const date = day.date; // "YYYY-MM-DD"

      // Daytime dominant code: look at hourly slots between 9:00–15:00
      const daytimeHourly = (day.hourly || []).filter(h => {
        const t = parseInt(h.time, 10);
        return t >= 900 && t <= 1500;
      });
      const midHour = daytimeHourly[Math.floor(daytimeHourly.length / 2)];
      const dominantCode = (midHour && midHour.weatherCode) || (day.hourly && day.hourly[0] && day.hourly[0].weatherCode) || '113';

      const info = codeInfo(dominantCode);

      // Max rain probability across hourly slots
      const rainProbs = (day.hourly || []).map(h => parseInt((h && h.chanceofrain) || '0', 10));
      const rainProb  = rainProbs.length > 0 ? Math.max(...rainProbs) : 0;

      // Total daily rain (sum of hourly precip)
      const rainMm = parseFloat(
        (day.hourly || []).reduce((sum, h) => sum + parseFloat((h && h.precipMM) || '0'), 0).toFixed(1)
      );

      return {
        date,
        maxTemp:  parseInt(day.maxtempC || '0', 10),
        minTemp:  parseInt(day.mintempC || '0', 10),
        rainMm,
        rainProb,
        windspeed: parseInt((day.hourly && day.hourly[3] && day.hourly[3].windspeedKmph) || '0', 10),
        desc: info.desc,
        icon: info.icon,
      };
    });

    // ── Rain alert: tomorrow >= 50% chance or >= 5mm ──────────────────────────
    const tomorrow  = forecast[1] || null;
    const rainAlert = !!(tomorrow && (tomorrow.rainProb >= 50 || tomorrow.rainMm >= 5));

    return res.json({
      location: { name: resolvedName, state: resolvedState },
      current,
      forecast,
      rainAlert,
      tomorrowRain: tomorrow
        ? { prob: tomorrow.rainProb, mm: tomorrow.rainMm, icon: tomorrow.icon, desc: tomorrow.desc }
        : null,
    });

  } catch (err) {
    console.error('Weather fetch error:', err.message);

    // ── Friendly error messages ───────────────────────────────────────────────
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'Could not find weather data for "' + locationQuery + '". Please check the location spelling.' });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(503).json({ error: 'Weather service timed out. Please try again.' });
    }
    return res.status(500).json({ error: 'Failed to fetch weather data. Please try again later.' });
  }
};
