const axios = require('axios');

exports.getMandiPrices = async (req, res) => {
  const { state, crop, limit = 100 } = req.query;
  const MANDI_API_KEY = process.env.MANDI_API_KEY;

  if (!MANDI_API_KEY) {
    return res.status(500).json({ error: 'Mandi API key not configured on server.' });
  }
  if (!state) {
    return res.status(400).json({ error: 'state query parameter is required.' });
  }

  try {
    const stateName = state.trim();
    const cropName  = crop ? crop.trim() : '';
    const fetchLimit = Math.min(Number(limit) || 100, 500);

    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${encodeURIComponent(MANDI_API_KEY)}&format=json&limit=${fetchLimit}&offset=0&filters[state.keyword]=${encodeURIComponent(stateName)}`;
    if (cropName) {
      url += `&filters[commodity]=${encodeURIComponent(cropName)}`;
    }

    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;

    if (!data || !Array.isArray(data.records)) {
      return res.status(502).json({ error: 'Unexpected response from Mandi API.' });
    }

    const records = data.records.map(r => ({
      state: r.state || '',
      district: r.district || '',
      market: r.market || '',
      commodity: r.commodity || '',
      variety: r.variety || '',
      grade: r.grade || '',
      arrival_date: r.arrival_date || '',
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      modal_price: Number(r.modal_price) || 0,
    }));

    records.sort((a, b) => {
      const toISO = d => d.split('/').reverse().join('-');
      const cmp = toISO(b.arrival_date || '00/00/0000').localeCompare(toISO(a.arrival_date || '00/00/0000'));
      return cmp !== 0 ? cmp : b.modal_price - a.modal_price;
    });

    res.json({
      state: stateName,
      total: data.total || records.length,
      returned: records.length,
      records,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mandi prices.' });
  }
};
