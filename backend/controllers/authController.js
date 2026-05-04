const Farmer = require('../models/Farmer');
const Vendor = require('../models/Vendor');
const { hash } = require('../utils/hash');

exports.register = async (req, res) => {
  const { role, name, phone, village, district, state, location, mandiLocation, password } = req.body;

  if (!role || !['farmer', 'vendor'].includes(role)) {
    return res.status(400).json({ error: 'Valid role (farmer or vendor) is required.' });
  }
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required.' });
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

  if (role === 'farmer') {
    if (!village || !state) {
      return res.status(400).json({ error: 'Village and state are required for farmers.' });
    }
  } else if (role === 'vendor') {
    if (!location || !mandiLocation) {
      return res.status(400).json({ error: 'Location and Mandi Location are required for vendors.' });
    }
  }

  try {
    const Model = role === 'farmer' ? Farmer : Vendor;
    const existingUser = await Model.findOne({ phone: phone.trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'This mobile number is already registered for this role. Please sign in.' });
    }

    let newUser;
    if (role === 'farmer') {
      newUser = new Farmer({
        id: `F${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        village: village.trim(),
        district: (district || '').trim(),
        state: state.trim(),
        passwordHash: hash(password)
      });
    } else {
      newUser = new Vendor({
        id: `V${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        mandiLocation: mandiLocation.trim(),
        passwordHash: hash(password)
      });
    }

    await newUser.save();
    console.log(`✅ Registered ${role}: ${newUser.name} | +91 ${newUser.phone}`);

    const userData = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      role: role
    };

    if (role === 'farmer') {
      userData.village = newUser.village;
      userData.district = newUser.district;
      userData.state = newUser.state;
    } else {
      userData.location = newUser.location;
      userData.mandiLocation = newUser.mandiLocation;
    }

    res.status(201).json({
      message: 'Account created successfully! You can now sign in.',
      user: userData,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  const { role, phone, password } = req.body;

  if (!role || !['farmer', 'vendor'].includes(role)) {
    return res.status(400).json({ error: 'Valid role (farmer or vendor) is required.' });
  }
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone number and password are required.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });
  }

  try {
    const Model = role === 'farmer' ? Farmer : Vendor;
    const user = await Model.findOne({
      phone: phone.trim(),
      passwordHash: hash(password)
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password. Please try again.' });
    }

    const tokenPayload = `${user.id}:${user.phone}:${Date.now()}`;
    const token = Buffer.from(tokenPayload).toString('base64');

    user.lastLogin = new Date().toISOString();
    await user.save();

    console.log(`🔓 Login ${role}: ${user.name} | +91 ${user.phone}`);

    const userData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: role
    };

    if (role === 'farmer') {
      userData.village = user.village;
      userData.district = user.district || '';
      userData.state = user.state;
    } else {
      userData.location = user.location;
      userData.mandiLocation = user.mandiLocation;
    }

    res.status(200).json({ token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({}, 'id name phone village state createdAt lastLogin');
    res.json({ count: farmers.length, farmers });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch farmers' });
  }
};
