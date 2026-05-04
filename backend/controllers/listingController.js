const CropListing = require('../models/CropListing');

exports.createListing = async (req, res) => {
  const { farmerId, farmerName, farmerPhone, village, district, state,
          cropName, quantity, pricePerUnit, quality, description, harvestDate } = req.body;

  if (!farmerId || !farmerName || !farmerPhone || !village || !state ||
      !cropName || !quantity || !pricePerUnit) {
    return res.status(400).json({ error: 'Missing required fields.' });
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
    res.status(201).json({ message: 'Listing posted successfully!', listing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing.' });
  }
};

exports.getListings = async (req, res) => {
  const { state, crop, quality, farmerId, limit = 50, skip = 0 } = req.query;

  const filter = { isAvailable: true };
  if (state) filter.state = { $regex: state.trim(), $options: 'i' };
  if (crop) filter.cropName = { $regex: crop.trim(), $options: 'i' };
  if (quality) filter.quality = quality.trim();
  if (farmerId) { delete filter.isAvailable; filter.farmerId = farmerId; }

  try {
    const total = await CropListing.countDocuments(filter);
    const listings = await CropListing
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ total, listings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
};

exports.deleteListing = async (req, res) => {
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
};
