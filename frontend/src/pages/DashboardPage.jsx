import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Leaf, User, Phone, MapPin, LogOut, Sprout, MessageCircle,
  CloudSun, TrendingUp, Calendar, Lightbulb, ChevronRight,
  Trash2, RefreshCw, ArrowRight, Sun, Cloud, Droplets, Wind,
  AlertTriangle, CloudRain, ShoppingCart, Search, Tag, FlaskConical,
  IndianRupee, Wheat, TreeDeciduous, Filter, Building2, ExternalLink, BadgeCheck,
  ShoppingBag,
} from 'lucide-react';
import './DashboardPage.css';

// ─── Seasonal Crop Calendar ────────────────────────────────────────────────
const MONTH_CROPS = {
  0: { season: 'Rabi (Winter)', crops: ['🌾 Wheat', '🫘 Chickpea', '🧅 Mustard', '🥬 Spinach', '🥕 Carrot'] },
  1: { season: 'Rabi (Winter)', crops: ['🌾 Wheat', '🫘 Lentil', '🧅 Onion', '🥦 Pea', '🌻 Sunflower'] },
  2: { season: 'Rabi Harvest', crops: ['🌻 Sunflower', '🧅 Onion', '🍅 Tomato', '🥬 Spinach', '🥕 Carrot'] },
  3: { season: 'Zaid (Summer)', crops: ['🍉 Watermelon', '🍈 Muskmelon', '🥒 Cucumber', '🌽 Maize', '🥬 Bitter Gourd'] },
  4: { season: 'Zaid (Summer)', crops: ['🍉 Watermelon', '🍆 Brinjal', '🫑 LadyFinger', '🌾 Moong Dal', '🌽 Maize'] },
  5: { season: 'Kharif Sowing', crops: ['🌾 Rice', '🌽 Maize', '🫘 Soybean', '🥜 Groundnut', '🌿 Cotton'] },
  6: { season: 'Kharif (Monsoon)', crops: ['🌾 Rice', '🌿 Cotton', '🫘 Soybean', '🥜 Groundnut', '🍚 Jowar'] },
  7: { season: 'Kharif (Monsoon)', crops: ['🌾 Rice', '🌿 Cotton', '🌴 Sugarcane', '🥜 Groundnut', '🫘 Arhar'] },
  8: { season: 'Kharif Harvest', crops: ['🌾 Rice', '🌿 Jute', '🌴 Sugarcane', '🫘 Arhar', '🍚 Bajra'] },
  9: { season: 'Rabi Sowing', crops: ['🌾 Wheat', '🫘 Chickpea', '🧅 Mustard', '🌻 Sunflower', '🥬 Spinach'] },
  10: { season: 'Rabi Sowing', crops: ['🌾 Wheat', '🫘 Lentil', '🧅 Mustard', '🥕 Carrot', '🥦 Pea'] },
  11: { season: 'Rabi (Winter)', crops: ['🌾 Wheat', '🫘 Chickpea', '🧅 Onion', '🥕 Carrot', '🥜 Pea'] },
};

// ─── Fertilizer Data (from CSV) ──────────────────────────────────────────────
const FERTILIZERS = [
  { name: 'Urea (46-0-0)', uses: 'Boosts vegetative growth; increases leaf and stem development; corrects nitrogen deficiency', description: 'Urea is the most widely used nitrogenous fertilizer in India, containing 46% nitrogen. It is highly soluble and rapidly absorbed by plants, making it ideal for top-dressing.', price: '₹266 per 45kg bag', cropType: 'Wheat; Rice; Maize; Sugarcane', soilType: 'Loamy; Clay loam; Sandy loam', nutrientFocus: 'N', emoji: '🌿' },
  { name: 'DAP (18-46-0)', uses: 'Promotes strong root development; enhances early plant establishment; supplies phosphorus and nitrogen', description: 'Di-Ammonium Phosphate (DAP) is one of the most popular phosphatic fertilizers in India. It provides both nitrogen and phosphorus in a highly available form, making it ideal for basal application.', price: '₹1350 per 50kg bag', cropType: 'All crops; especially Rice; Wheat; Pulses', soilType: 'All soil types', nutrientFocus: 'N-P', emoji: '🌾' },
  { name: 'NPK 10-26-26', uses: 'Supports balanced growth; enhances flowering and fruiting; strengthens roots', description: 'This NPK blend offers a high phosphorus and potassium ratio with moderate nitrogen, making it ideal for the reproductive stage of crops. It improves yield quality and stress tolerance.', price: '₹1450 per 50kg bag', cropType: 'Vegetables; Fruits; Cotton; Oilseeds', soilType: 'Sandy loam; Loamy', nutrientFocus: 'N-P-K', emoji: '🍅' },
  { name: 'NPK 12-32-16', uses: 'Enhances root and shoot development; supports early crop growth; increases tillering', description: 'A balanced NPK fertilizer with a higher phosphorus content suitable for basal application in most crops. It supports both vegetative and early reproductive growth stages.', price: '₹1500 per 50kg bag', cropType: 'Rice; Wheat; Pulses; Vegetables', soilType: 'Alluvial; Loamy', nutrientFocus: 'N-P-K', emoji: '🌾' },
  { name: 'NPK 20-20-20', uses: 'Provides equal proportions of N-P-K for all-round growth; suitable for foliar spray and fertigation', description: 'This fully water-soluble NPK fertilizer is widely used in drip and foliar applications. It ensures balanced nutrition throughout the crop cycle and is especially popular in horticulture.', price: '₹120 per kg', cropType: 'Fruits; Vegetables; Flowers; Plantation crops', soilType: 'All soil types', nutrientFocus: 'N-P-K', emoji: '🌸' },
  { name: 'NPK 19-19-19', uses: 'Promotes uniform growth; ideal for fertigation and foliar feeding; corrects multi-nutrient deficiency', description: 'A fully water-soluble grade suitable for all crops during active growth phases. Often used in fertigation systems and as a foliar spray to maintain balanced nutrition.', price: '₹115 per kg', cropType: 'All crops; Orchards; Vegetables', soilType: 'Sandy; Loamy; Red soil', nutrientFocus: 'N-P-K', emoji: '🥦' },
  { name: 'Muriate of Potash (MOP)', uses: 'Improves fruit quality and size; increases disease resistance; enhances water use efficiency', description: 'Muriate of Potash (0-0-60) is the most commonly used potassium fertilizer in India. It strengthens cell walls, improves drought tolerance, and enhances the shelf life of produce.', price: '₹900 per 50kg bag', cropType: 'Potato; Banana; Sugarcane; Vegetables', soilType: 'Loamy; Sandy loam', nutrientFocus: 'K', emoji: '🍌' },
  { name: 'Sulphate of Potash (SOP)', uses: 'Enhances fruit color and sweetness; safe for chloride-sensitive crops; improves crop quality', description: 'Sulphate of Potash (0-0-50) provides potassium along with sulphur and is recommended for chloride-sensitive crops like grapes, pomegranate, and potato.', price: '₹65 per kg', cropType: 'Grapes; Pomegranate; Potato; Tomato', soilType: 'Sandy loam; Red laterite', nutrientFocus: 'K-S', emoji: '🍇' },
  { name: 'Single Super Phosphate (SSP)', uses: 'Supplies phosphorus and sulphur; improves root growth; corrects sulphur deficiency', description: 'SSP (16% P2O5; 11% S) is a cost-effective source of both phosphorus and sulphur. It is widely used in India for oilseed and pulse crops where sulphur nutrition is equally important.', price: '₹400 per 50kg bag', cropType: 'Oilseeds; Pulses; Groundnut; Mustard', soilType: 'Black; Alluvial; Loamy', nutrientFocus: 'P-S', emoji: '🥜' },
  { name: 'Zinc Sulphate', uses: 'Corrects zinc deficiency; improves grain filling and seed quality; enhances enzyme activity', description: 'Zinc Sulphate (21% Zn) is the most widely used micronutrient fertilizer in India, where zinc deficiency is widespread. It promotes healthy root growth and increases grain yield in cereals.', price: '₹120 per kg', cropType: 'Rice; Wheat; Maize; Fruits', soilType: 'Sandy; Light textured; Calcareous', nutrientFocus: 'Micronutrients (Zn)', emoji: '🌽' },
  { name: 'Vermicompost', uses: 'Improves soil structure and microbial activity; supplies balanced macro and micronutrients; enhances water retention', description: 'Vermicompost is produced by earthworm digestion of organic waste and is rich in humus, beneficial microbes, enzymes, and plant growth hormones. It improves soil fertility and promotes sustainable agriculture.', price: '₹8 per kg / ₹350 per 50kg bag', cropType: 'All crops; Vegetables; Fruits; Ornamentals', soilType: 'All soil types; especially Sandy and degraded soils', nutrientFocus: 'Organic matter; N-P-K-Micronutrients', emoji: '🪱' },
  { name: 'Farmyard Manure (FYM)', uses: 'Improves soil organic matter; enhances microbial life; supplies slow-release nutrients', description: 'FYM is a mixture of animal dung, urine, and decomposed crop residues. When well-decomposed, it supplies a balanced range of nutrients and significantly improves soil water-holding capacity.', price: '₹1500 per tonne', cropType: 'All field crops; Vegetables; Orchards', soilType: 'Degraded; Sandy; Clay soils', nutrientFocus: 'Organic matter; N-P-K', emoji: '🌱' },
  { name: 'Neem Cake', uses: 'Acts as natural pest deterrent; improves nitrogen efficiency; suppresses soil-borne pathogens', description: 'Neem Cake is the residue obtained after cold pressing of neem seeds. It contains azadirachtin which inhibits nematodes and soil insects, while slowing nitrification and improving fertilizer use efficiency.', price: '₹15 per kg', cropType: 'Vegetables; Rice; Sugarcane; Pulses', soilType: 'All soil types', nutrientFocus: 'N-Organic matter', emoji: '🌿' },
  { name: 'Seaweed Extract', uses: 'Stimulates plant growth hormones; improves stress tolerance; enhances nutrient absorption', description: 'Seaweed extract contains cytokinins, auxins, and alginates that promote cell division and root development. It helps crops withstand drought, salinity, and frost stress while improving yield and quality.', price: '₹350 per litre', cropType: 'All crops; especially Horticulture; Grapes; Tomato', soilType: 'All soil types', nutrientFocus: 'Biostimulant; Micronutrients', emoji: '🌊' },
  { name: 'Gypsum (Calcium Sulphate)', uses: 'Reclaims sodic soils; supplies calcium and sulphur; improves soil structure in clay soils', description: 'Gypsum (23% Ca; 18% S) is a valuable soil amendment that replaces exchangeable sodium in sodic soils, improving structure and drainage. It supplies sulphur and calcium without affecting pH.', price: '₹5 per kg', cropType: 'All crops; especially Groundnut; Oilseeds; Pulses', soilType: 'Sodic; Saline-sodic; Clay soils', nutrientFocus: 'Ca-S', emoji: '🪨' },
  { name: 'Biofertilizer – Rhizobium', uses: 'Fixes atmospheric nitrogen symbiotically in legume root nodules; reduces chemical nitrogen requirement', description: 'Rhizobium is a nitrogen-fixing bacterial biofertilizer that forms symbiotic nodules on legume roots. It can fix 50–200 kg N/ha per season, significantly reducing the need for chemical nitrogen fertilizers.', price: '₹60 per 200g packet', cropType: 'Soybean; Groundnut; Chickpea; Lentil', soilType: 'All soil types', nutrientFocus: 'N (Biological fixation)', emoji: '🦠' },
  { name: 'Calcium Nitrate (15.5-0-0)', uses: 'Supplies calcium for strong cell walls; prevents blossom-end rot; provides fast-acting nitrogen', description: 'Calcium Nitrate is a fully water-soluble fertilizer used primarily in fertigation. It supplies both calcium and nitrate nitrogen, preventing disorders like blossom-end rot in tomato.', price: '₹75 per kg', cropType: 'Tomato; Capsicum; Apple; Lettuce', soilType: 'Sandy; Acidic; Light soils', nutrientFocus: 'N-Ca', emoji: '🍅' },
  { name: 'NPK 15-15-15', uses: 'Provides balanced equal-ratio N-P-K nutrition; suitable for maintenance fertilization; versatile', description: 'NPK 15-15-15 is a general-purpose compound fertilizer offering equal and balanced nutrition. It is commonly used as a basal dose in diverse crops where soil nutrient status is moderate.', price: '₹1400 per 50kg bag', cropType: 'Vegetables; Fruits; Field crops; Turf', soilType: 'All soil types', nutrientFocus: 'N-P-K', emoji: '🌿' },
];

const NUTRIENT_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Nitrogen (N)', value: 'N' },
  { label: 'Phosphorus (P)', value: 'P' },
  { label: 'Potassium (K)', value: 'K' },
  { label: 'NPK', value: 'N-P-K' },
  { label: 'Organic', value: 'Organic matter' },
  { label: 'Micronutrients', value: 'Micronutrients' },
  { label: 'Biostimulant', value: 'Biostimulant' },
];

// ─── Government Schemes ───────────────────────────────────────────────────────
const GOV_SCHEMES = [
  { name: 'PM-KISAN', use: 'Provides income support of ₹6000 per year to eligible farmers', link: 'https://pmkisan.gov.in/', emoji: '💰', tag: 'Income Support' },
  { name: 'PM Fasal Bima Yojana', use: 'Crop insurance scheme to protect farmers from crop loss due to natural calamities', link: 'https://pmfby.gov.in/', emoji: '🛡️', tag: 'Crop Insurance' },
  { name: 'Kisan Credit Card', use: 'Provides short-term credit and loans for farming needs at subsidised interest rates', link: 'https://www.myscheme.gov.in/schemes/kcc', emoji: '💳', tag: 'Credit & Loans' },
  { name: 'Soil Health Card Scheme', use: 'Provides soil testing and fertilizer recommendations tailored to your field', link: 'https://soilhealth.dac.gov.in/', emoji: '🧪', tag: 'Soil Health' },
  { name: 'PM Krishi Sinchai Yojana', use: 'Improves irrigation infrastructure and water access for farming communities', link: 'https://pmksy.gov.in/', emoji: '💧', tag: 'Irrigation' },
  { name: 'Paramparagat Krishi Vikas Yojana', use: 'Promotes organic farming practices and helps farmers transition to organic cultivation', link: 'https://pgsindia-ncof.gov.in/pkvy/index.aspx', emoji: '🌿', tag: 'Organic Farming' },
  { name: 'PM Kusum Scheme', use: 'Supports solar pumps and renewable energy solutions for irrigation and farm power', link: 'https://pmkusum.mnre.gov.in/', emoji: '☀️', tag: 'Solar Energy' },
  { name: 'e-NAM', use: 'Online national marketplace for buying and selling agricultural produce at fair prices', link: 'https://www.enam.gov.in/', emoji: '🏪', tag: 'Market Access' },
  { name: 'Rashtriya Krishi Vikas Yojana', use: 'Supports agricultural infrastructure development and modernisation of farming', link: 'https://rkvy.nic.in/', emoji: '🏗️', tag: 'Infrastructure' },
  { name: 'National Mission for Sustainable Agriculture', use: 'Encourages climate-resilient and sustainable farming practices across India', link: 'https://nmsa.dac.gov.in/', emoji: '🌱', tag: 'Sustainability' },
];

// ─── Farming Tips ──────────────────────────────────────────────────────────
const TIPS = [
  { emoji: '💧', title: 'Drip Irrigation Saves Water', tip: 'Drip irrigation uses 30–50% less water than flood irrigation. Install micro-drippers near roots for best results.' },
  { emoji: '🌿', title: 'Crop Rotation Boosts Soil', tip: 'Rotate crops every season to replenish soil nutrients naturally. Legumes like chickpea fix nitrogen, reducing fertilizer costs.' },
  { emoji: '🐝', title: 'Attract Pollinators', tip: 'Plant marigold or mustard around your field borders to attract bees and improve yields by 15–20%.' },
  { emoji: '🧪', title: 'Test Soil pH First', tip: 'Most crops grow best at pH 6–7. Use a simple soil kit to test before sowing. Lime raises pH; sulfur lowers it.' },
  { emoji: '☀️', title: 'Mulching Reduces Weeds', tip: 'Cover soil with dry leaves or straw (mulch). It retains moisture, reduces weeds, and improves soil carbon.' },
  { emoji: '🌧️', title: 'Use Rainwater Harvesting', tip: 'Build a small farm pond or bunding to capture monsoon runoff. Even a small storage can irrigate through dry spells.' },
  { emoji: '🦟', title: 'Neem-Based Pest Control', tip: 'Spray diluted neem oil on leaves to repel insects organically. Mix 5ml neem oil + 1ml soap + 1 litre water.' },
  { emoji: '📊', title: 'Record Your Yields', tip: 'Keep a simple notebook of what you grew, when, and how much you harvested. This data helps plan better each year.' },
];

// ─── Format forecast date label ────────────────────────────────────────────
const formatDay = (dateStr, index) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  // Mandi prices state
  const [mandiData, setMandiData] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiError, setMandiError] = useState(null);
  const [mandiCropFilter, setMandiCropFilter] = useState('');
  const [mandiSearchInput, setMandiSearchInput] = useState('');

  // Fertilizer state
  const [fertSearch, setFertSearch] = useState('');
  const [fertNutrient, setFertNutrient] = useState('');
  const [expandedFert, setExpandedFert] = useState(null);

  // Tab navigation state
  const [activeSection, setActiveSection] = useState('overview');
  const [mySellings, setMySellings] = useState([]);

  const month = new Date().getMonth();
  const calendar = MONTH_CROPS[month];

  // ── Load user from localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/auth'); return; }
    setUser(JSON.parse(stored));

    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [navigate]);

  // ── Fetch my sell listings ──
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/listings?farmerId=${user.id}`)
      .then(r => r.json())
      .then(d => setMySellings(d.listings || []))
      .catch(() => { });
  }, [user]);

  // ── Load prediction history ──
  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    setPredictions(hist);
  }, []);

  // ── Rotate tips every 8 seconds ──
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  // ── Fetch weather by village name ──
  useEffect(() => {
    if (!user) return;
    setWeatherLoading(true);
    setWeatherError(null);

    const params = new URLSearchParams({
      village: user.village,
      district: user.district || '',
      state: user.state || '',
    });

    fetch(`http://localhost:5000/api/weather?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setWeatherError(data.error);
        } else {
          setWeather(data);
        }
      })
      .catch(() => setWeatherError('Could not load weather data.'))
      .finally(() => setWeatherLoading(false));
  }, [user]);

  // ── Fetch mandi prices by user's state ──
  const fetchMandiPrices = (cropFilter = '') => {
    if (!user) return;
    setMandiLoading(true);
    setMandiError(null);
    const params = new URLSearchParams({
      state: user.state,
      limit: '60',
      ...(cropFilter.trim() ? { crop: cropFilter.trim() } : {}),
    });
    fetch(`http://localhost:5000/api/mandi-prices?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setMandiError(data.error);
        else setMandiData(data);
      })
      .catch(() => setMandiError('Could not load mandi prices.'))
      .finally(() => setMandiLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchMandiPrices('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMandiSearch = (e) => {
    e.preventDefault();
    setMandiCropFilter(mandiSearchInput);
    fetchMandiPrices(mandiSearchInput);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const clearHistory = () => {
    localStorage.removeItem('predictionHistory');
    setPredictions([]);
  };

  const tip = TIPS[tipIndex];

  if (!user) return null;

  const rainAlert = weather?.rainAlert && showAlert;
  const tomorrow = weather?.tomorrowRain;

  return (
    <div className="dashboard" id="dashboard">

      {/* ── Rain Alert Banner ── */}
      {rainAlert && (
        <div className="rain-alert-banner" id="rain-alert-banner" role="alert">
          <div className="rain-alert-banner__inner">
            <AlertTriangle size={18} />
            <span>
              <strong>⚠️ Rain Alert for Tomorrow!</strong>&nbsp;
              {tomorrow?.desc} expected in <strong>{user.village}</strong> —{' '}
              {tomorrow?.prob}% chance, {tomorrow?.mm}mm rain.{' '}
              Cover your crops, avoid spraying pesticides, and check drainage channels.
            </span>
            <button className="rain-alert-banner__close" onClick={() => setShowAlert(false)} title="Dismiss">✕</button>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="dashboard__sidebar" id="dashboard-sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <Leaf size={20} />
          </div>
          <span>KrishiSetu</span>
        </div>

        <nav className="sidebar__nav">
          <button className={`sidebar__link ${activeSection === 'overview' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('overview')}>
            <TrendingUp size={18} /> Overview
          </button>
          <Link to="/predict" className="sidebar__link">
            <Sprout size={18} /> Crop Predictor
          </Link>
          <button className={`sidebar__link ${activeSection === 'weather' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('weather')}>
            <CloudSun size={18} /> Weather Forecast
          </button>
          <button className={`sidebar__link ${activeSection === 'history' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('history')}>
            <Calendar size={18} /> My History
          </button>
          <button className={`sidebar__link ${activeSection === 'calendar' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('calendar')}>
            <Calendar size={18} /> Crop Calendar
          </button>
          <button className={`sidebar__link ${activeSection === 'tips' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('tips')}>
            <Lightbulb size={18} /> Farming Tips
          </button>
          <button className={`sidebar__link ${activeSection === 'mandi' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('mandi')}>
            <ShoppingCart size={18} /> Mandi Prices
          </button>
          <button className={`sidebar__link ${activeSection === 'fertilizer' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('fertilizer')}>
            <FlaskConical size={18} /> Fertilizer Guide
          </button>
          <button className={`sidebar__link ${activeSection === 'schemes' ? 'sidebar__link--active' : ''}`} onClick={() => setActiveSection('schemes')}>
            <Building2 size={18} /> Govt Schemes
          </button>
          <Link to="/sell" className="sidebar__link">
            <ShoppingBag size={18} /> Sell Your Crop
          </Link>
        </nav>

        <button className="sidebar__logout" onClick={handleLogout} id="logout-btn">
          <LogOut size={17} />
          Sign Out
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard__main" id="dashboard-main">

        {/* ── Top Header ── */}
        <header className="dashboard__header" id="overview">
          <div>
            <p className="dashboard__greeting">{greeting}, 👋</p>
            <h1 className="dashboard__username">{user.name}</h1>
            <p className="dashboard__location">
              <MapPin size={13} /> {user.village}, {user.state}
            </p>
          </div>
          <button className="dashboard__logout-mobile" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </header>

        {/* ── Stats Row ── */}
        {activeSection === 'overview' && (
          <div className="dashboard__stats" id="dashboard-stats">
            <div className="stat-card stat-card--green">
              <div className="stat-card__icon">🌾</div>
              <div>
                <p className="stat-card__num">{predictions.length}</p>
                <p className="stat-card__label">Predictions Made</p>
              </div>
            </div>
            <div className="stat-card stat-card--terra">
              <div className="stat-card__icon">🗓️</div>
              <div>
                <p className="stat-card__num">{calendar.season.split(' ')[0]}</p>
                <p className="stat-card__label">Current Season</p>
              </div>
            </div>
            <div className="stat-card stat-card--blue">
              <div className="stat-card__icon">💧</div>
              <div>
                <p className="stat-card__num">{weather ? `${weather.current.humidity}%` : '--'}</p>
                <p className="stat-card__label">Humidity</p>
              </div>
            </div>
            <div className="stat-card stat-card--brown">
              <div className="stat-card__icon">🌡️</div>
              <div>
                <p className="stat-card__num">{weather ? `${weather.current.temp}°C` : '--'}</p>
                <p className="stat-card__label">Temperature</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Grid Layout ── */}
        <div className="dashboard__grid">

          {/* ── Overview Layout ── */}
          {activeSection === 'overview' && (
            <>
              {/* ── Farmer Profile Card ── */}
              <div className="widget widget--profile" id="profile-widget">
                <div className="widget__header">
                  <User size={18} /> <span>My Profile</span>
                </div>
                <div className="profile__body">
                  <div className="profile__avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="profile__name">{user.name}</h3>
                  <div className="profile__details">
                    <div className="profile__detail">
                      <Phone size={14} />
                      <span>+91 {user.phone}</span>
                    </div>
                    <div className="profile__detail">
                      <MapPin size={14} />
                      <span>{user.village}{user.district ? `, ${user.district}` : ''}</span>
                    </div>
                    <div className="profile__detail">
                      <Leaf size={14} />
                      <span>{user.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── My Sellings Widget ── */}
              <div className="widget widget--my-sellings" id="my-sellings-widget">
                <div className="widget__header">
                  <ShoppingBag size={18} /> <span>Crops on Sale</span>
                </div>
                <div className="my-sellings-list">
                  {mySellings.length === 0 ? (
                    <div className="my-sellings-empty">
                      <p>No crops listed.</p>
                      <Link to="/sell" className="btn-link">Sell your crop →</Link>
                    </div>
                  ) : (
                    <>
                      {mySellings.slice(0, 3).map(listing => (
                        <div key={listing._id} className="selling-mini-card">
                          <div className="selling-mini-top">
                            <span className="selling-mini-name">{listing.cropName}</span>
                            <span className="selling-mini-qty">{listing.quantity} {listing.unit}</span>
                          </div>
                          <div className="selling-mini-price">₹{listing.pricePerUnit}/{listing.unit}</div>
                        </div>
                      ))}
                      {mySellings.length > 3 ? (
                        <Link to="/sell" className="selling-view-more">
                          View {mySellings.length - 3} More →
                        </Link>
                      ) : (
                        <Link to="/sell" className="selling-view-more">
                          Manage Listings →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Weather Widget ── */}
          {(activeSection === 'overview' || activeSection === 'weather') && (
            <div className="widget widget--weather widget--wide" id="weather-widget">
              <div className="widget__header">
                <CloudSun size={18} />
                <span>
                  Weather Forecast
                  {weather?.location && (
                    <span className="weather__location-label"> — {weather.location.name}, {weather.location.state}</span>
                  )}
                </span>
                {weather && (
                  <button
                    className="widget__action-btn"
                    onClick={() => {
                      setWeatherLoading(true);
                      const params = new URLSearchParams({ village: user.village, district: user.district || '', state: user.state || '' });
                      fetch(`http://localhost:5000/api/weather?${params}`)
                        .then(r => r.json()).then(setWeather).finally(() => setWeatherLoading(false));
                    }}
                    title="Refresh"
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                )}
              </div>

              {weatherLoading ? (
                <div className="widget__loading">
                  <RefreshCw size={20} className="spin" />
                  <span>Fetching weather for {user?.village}…</span>
                </div>
              ) : weatherError ? (
                <div className="widget__empty">
                  <p>🌐 {weatherError}</p>
                </div>
              ) : weather ? (
                <div className="weather__content">
                  {/* Current conditions */}
                  <div className="weather__current-row">
                    <div className="weather__main">
                      <span className="weather__icon">{weather.current.icon}</span>
                      <div>
                        <p className="weather__temp">{weather.current.temp}°C</p>
                        <p className="weather__desc">{weather.current.desc}</p>
                      </div>
                    </div>
                    <div className="weather__details">
                      <div className="weather__detail">
                        <Droplets size={14} /> {weather.current.humidity}% Humidity
                      </div>
                      <div className="weather__detail">
                        <Wind size={14} /> Wind {weather.current.wind} km/h
                      </div>
                      <div className="weather__detail">
                        <CloudRain size={14} /> {weather.forecast?.[0]?.rainProb ?? 0}% Rain today
                      </div>
                    </div>
                  </div>

                  {/* 5-Day Forecast */}
                  <div className="weather__forecast">
                    {weather.forecast.slice(0, 5).map((day, i) => (
                      <div
                        key={day.date}
                        className={`forecast__day ${i === 1 && weather.rainAlert ? 'forecast__day--rain-alert' : ''}`}
                      >
                        <span className="forecast__label">{formatDay(day.date, i)}</span>
                        <span className="forecast__icon">{day.icon}</span>
                        <span className="forecast__desc">{day.desc}</span>
                        <div className="forecast__temps">
                          <span className="forecast__max">{day.maxTemp}°</span>
                          <span className="forecast__min">{day.minTemp}°</span>
                        </div>
                        <div className="forecast__rain-bar">
                          <div
                            className="forecast__rain-fill"
                            style={{ width: `${Math.min(day.rainProb, 100)}%` }}
                          />
                        </div>
                        <span className="forecast__rain-pct">{day.rainProb}%</span>
                        {i === 1 && weather.rainAlert && (
                          <span className="forecast__alert-tag">⚠️ Rain Alert</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ── Quick Actions ── */}
          {activeSection === 'overview' && (
            <div className="widget widget--actions" id="quick-actions">
              <div className="widget__header">
                <Sprout size={18} /> <span>Quick Actions</span>
              </div>
              <div className="actions__grid">
                <Link to="/predict" className="action-btn action-btn--green" id="action-predict">
                  <span className="action-btn__icon">🌾</span>
                  <span className="action-btn__text">Predict Crop</span>
                  <ArrowRight size={15} />
                </Link>
                <button
                  className="action-btn action-btn--teal"
                  id="action-chat"
                  onClick={() => document.getElementById('chatbot-toggle')?.click()}
                >
                  <span className="action-btn__icon">🤖</span>
                  <span className="action-btn__text">Ask AI Advisor</span>
                  <ArrowRight size={15} />
                </button>
                <a href="#calendar" className="action-btn action-btn--brown" id="action-calendar">
                  <span className="action-btn__icon">📅</span>
                  <span className="action-btn__text">Crop Calendar</span>
                  <ArrowRight size={15} />
                </a>
                <a href="#tips" className="action-btn action-btn--amber" id="action-tips">
                  <span className="action-btn__icon">💡</span>
                  <span className="action-btn__text">Farming Tips</span>
                  <ArrowRight size={15} />
                </a>
                <a href="#fertilizer-guide" className="action-btn action-btn--purple" id="action-fertilizer">
                  <span className="action-btn__icon">🧪</span>
                  <span className="action-btn__text">Fertilizer Guide</span>
                  <ArrowRight size={15} />
                </a>
                <Link to="/sell" className="action-btn action-btn--orange" id="action-sell">
                  <span className="action-btn__icon">🛒</span>
                  <span className="action-btn__text">Sell Your Crop</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}

          {/* ── Prediction History ── */}
          {activeSection === 'history' && (
            <div className="widget widget--history widget--wide" id="history">
              <div className="widget__header">
                <TrendingUp size={18} /> <span>My Prediction History</span>
                {predictions.length > 0 && (
                  <button className="widget__action-btn" onClick={clearHistory} title="Clear history">
                    <Trash2 size={14} /> Clear
                  </button>
                )}
              </div>
              {predictions.length === 0 ? (
                <div className="widget__empty">
                  <p>🌱 No predictions yet.</p>
                  <Link to="/predict" className="widget__empty-link">Make your first prediction →</Link>
                </div>
              ) : (
                <div className="history__list">
                  {predictions.slice().reverse().map((p, i) => (
                    <div className="history__item" key={i} id={`history-item-${i}`}>
                      <div className="history__crop-icon">🌾</div>
                      <div className="history__crop-info">
                        <span className="history__crop-name">{p.crop}</span>
                        <span className="history__crop-date">{p.date}</span>
                      </div>
                      <div className="history__crop-meta">
                        <span className="history__soil">{p.soil}</span>
                        <span className="history__temp">🌡️ {p.temp}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Mandi Prices Widget ── */}
          {activeSection === 'mandi' && (
            <div className="widget widget--mandi widget--wide" id="mandi-prices">
              <div className="widget__header">
                <ShoppingCart size={18} />
                <span>
                  Mandi Prices
                  {mandiData && (
                    <span className="mandi__state-badge">{mandiData.state}</span>
                  )}
                </span>
                <button
                  className="widget__action-btn"
                  onClick={() => { setMandiSearchInput(''); setMandiCropFilter(''); fetchMandiPrices(''); }}
                  title="Refresh"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {/* Crop search */}
              <form className="mandi__search-row" onSubmit={handleMandiSearch} id="mandi-search-form">
                <div className="mandi__search-input-wrap">
                  <Search size={14} className="mandi__search-icon" />
                  <input
                    id="mandi-crop-search"
                    type="text"
                    className="mandi__search-input"
                    placeholder="Search crop (e.g. Wheat, Rice, Onion)…"
                    value={mandiSearchInput}
                    onChange={e => setMandiSearchInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="mandi__search-btn" id="mandi-search-btn">Search</button>
                {mandiCropFilter && (
                  <button
                    type="button"
                    className="mandi__clear-btn"
                    onClick={() => { setMandiSearchInput(''); setMandiCropFilter(''); fetchMandiPrices(''); }}
                  >✕ Clear</button>
                )}
              </form>

              {mandiLoading ? (
                <div className="widget__loading">
                  <RefreshCw size={20} className="spin" />
                  <span>Loading mandi prices for {user?.state}…</span>
                </div>
              ) : mandiError ? (
                <div className="widget__empty">
                  <p>🏪 {mandiError}</p>
                  <button className="widget__empty-link" onClick={() => fetchMandiPrices(mandiCropFilter)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Retry →</button>
                </div>
              ) : mandiData && mandiData.records.length === 0 ? (
                <div className="widget__empty">
                  <p>🌾 No records found{mandiCropFilter ? ` for "${mandiCropFilter}"` : ''} in {mandiData.state}.</p>
                </div>
              ) : mandiData ? (
                <div className="mandi__table-wrap">
                  {mandiCropFilter && (
                    <div className="mandi__filter-tag">
                      <Tag size={12} /> Showing results for: <strong>{mandiCropFilter}</strong> · {mandiData.records.length} records
                    </div>
                  )}
                  <table className="mandi__table" id="mandi-price-table">
                    <thead>
                      <tr>
                        <th>Commodity</th>
                        <th>Market</th>
                        <th>District</th>
                        <th>Date</th>
                        <th>Min ₹</th>
                        <th>Modal ₹</th>
                        <th>Max ₹</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandiData.records.map((r, i) => (
                        <tr key={i} className="mandi__row" id={`mandi-row-${i}`}>
                          <td>
                            <span className="mandi__commodity">{r.commodity}</span>
                            {r.variety && r.variety !== 'FAQ' && (
                              <span className="mandi__variety">{r.variety}</span>
                            )}
                          </td>
                          <td className="mandi__market">{r.market}</td>
                          <td className="mandi__district">{r.district}</td>
                          <td className="mandi__date">{r.arrival_date}</td>
                          <td className="mandi__price mandi__price--min">₹{r.min_price.toLocaleString('en-IN')}</td>
                          <td>
                            <span className="mandi__modal-badge">₹{r.modal_price.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="mandi__price mandi__price--max">₹{r.max_price.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mandi__footnote">📊 Source: Agmarknet / data.gov.in · Prices in ₹/Quintal · Showing latest {mandiData.records.length} of {Number(mandiData.total).toLocaleString('en-IN')} records</p>
                </div>
              ) : null}
            </div>
          )}

          {/* ── Seasonal Crop Calendar ── */}
          {activeSection === 'calendar' && (
            <div className="widget widget--calendar" id="calendar">
              <div className="widget__header">
                <Calendar size={18} />
                <span>Seasonal Crop Calendar</span>
                <span className="widget__badge">{new Date().toLocaleString('default', { month: 'long' })}</span>
              </div>
              <div className="calendar__season">
                <span className="calendar__season-tag">{calendar.season}</span>
              </div>
              <div className="calendar__crops">
                {calendar.crops.map((crop, i) => (
                  <div className="calendar__crop-pill" key={i}>
                    {crop}
                  </div>
                ))}
              </div>
              <p className="calendar__note">
                🗓️ These crops are best sown / harvested during this month in most Indian regions.
              </p>
            </div>
          )}

          {/* ── Farming Tips ── */}
          {activeSection === 'tips' && (
            <div className="widget widget--tips" id="tips">
              <div className="widget__header">
                <Lightbulb size={18} /> <span>Farming Tip of the Day</span>
                <button
                  className="widget__action-btn"
                  onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
                  title="Next tip"
                >
                  <RefreshCw size={14} /> Next
                </button>
              </div>
              <div className="tip__body" key={tipIndex}>
                <div className="tip__emoji">{tip.emoji}</div>
                <div>
                  <h4 className="tip__title">{tip.title}</h4>
                  <p className="tip__text">{tip.tip}</p>
                </div>
              </div>
              <div className="tip__dots">
                {TIPS.map((_, i) => (
                  <button
                    key={i}
                    className={`tip__dot ${i === tipIndex ? 'tip__dot--active' : ''}`}
                    onClick={() => setTipIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Fertilizer Guide ── */}
          {activeSection === 'fertilizer' && (
            <div className="widget widget--fertilizer widget--full" id="fertilizer-guide">
              <div className="widget__header">
                <FlaskConical size={18} />
                <span>Fertilizer Guide</span>
                <span className="widget__badge">🧪 {FERTILIZERS.length} Fertilizers</span>
              </div>

              {/* Search + Filter Row */}
              <div className="fert__controls">
                <div className="fert__search-wrap">
                  <Search size={14} className="fert__search-icon" />
                  <input
                    id="fert-search-input"
                    type="text"
                    className="fert__search-input"
                    placeholder="Search fertilizer name or crop…"
                    value={fertSearch}
                    onChange={e => setFertSearch(e.target.value)}
                  />
                  {fertSearch && (
                    <button className="fert__search-clear" onClick={() => setFertSearch('')}>✕</button>
                  )}
                </div>
                <div className="fert__filter-tabs">
                  {NUTRIENT_FILTERS.map(f => (
                    <button
                      key={f.value}
                      className={`fert__filter-tab ${fertNutrient === f.value ? 'fert__filter-tab--active' : ''}`}
                      onClick={() => setFertNutrient(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              {(() => {
                const filtered = FERTILIZERS.filter(f => {
                  const q = fertSearch.toLowerCase();
                  const matchSearch = !q || f.name.toLowerCase().includes(q) || f.cropType.toLowerCase().includes(q) || f.uses.toLowerCase().includes(q);
                  const matchNutrient = !fertNutrient || f.nutrientFocus.includes(fertNutrient);
                  return matchSearch && matchNutrient;
                });
                if (filtered.length === 0) return (
                  <div className="widget__empty">
                    <p>🧪 No fertilizers found for your search.</p>
                    <button className="widget__empty-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setFertSearch(''); setFertNutrient(''); }}>Clear filters →</button>
                  </div>
                );
                return (
                  <div className="fert__grid">
                    {filtered.map((fert, i) => (
                      <div
                        key={fert.name}
                        className={`fert-card ${expandedFert === i ? 'fert-card--expanded' : ''}`}
                        id={`fert-card-${i}`}
                        onClick={() => setExpandedFert(expandedFert === i ? null : i)}
                      >
                        <div className="fert-card__top">
                          <span className="fert-card__emoji">{fert.emoji}</span>
                          <div className="fert-card__info">
                            <h4 className="fert-card__name">{fert.name}</h4>
                            <span className="fert-card__nutrient">{fert.nutrientFocus}</span>
                          </div>
                        </div>
                        <p className="fert-card__uses">{fert.uses}</p>
                        <div className={`fert-card__detail ${expandedFert === i ? 'fert-card__detail--visible' : ''}`}>
                          <p className="fert-card__desc">{fert.description}</p>
                          <div className="fert-card__meta">
                            <div className="fert-card__meta-item">
                              <IndianRupee size={12} />
                              <span>{fert.price}</span>
                            </div>
                            <div className="fert-card__meta-item">
                              <Wheat size={12} />
                              <span>{fert.cropType}</span>
                            </div>
                            <div className="fert-card__meta-item">
                              <TreeDeciduous size={12} />
                              <span>{fert.soilType}</span>
                            </div>
                          </div>
                        </div>
                        <button className="fert-card__toggle">
                          {expandedFert === i ? '▲ Less info' : '▼ More info'}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Government Schemes ── */}
          {activeSection === 'schemes' && (
            <div className="widget widget--schemes widget--full" id="govt-schemes">
              <div className="widget__header">
                <Building2 size={18} />
                <span>Government Schemes for Farmers</span>
                <span className="widget__badge">🇮🇳 {GOV_SCHEMES.length} Schemes</span>
              </div>
              <p className="schemes__subtitle">
                Explore central government programmes designed to support and empower Indian farmers.
              </p>
              <div className="schemes__grid">
                {GOV_SCHEMES.map((scheme, i) => (
                  <a
                    key={scheme.name}
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-card"
                    id={`scheme-card-${i}`}
                  >
                    <div className="scheme-card__header">
                      <span className="scheme-card__emoji">{scheme.emoji}</span>
                      <span className="scheme-card__tag">{scheme.tag}</span>
                    </div>
                    <h4 className="scheme-card__name">{scheme.name}</h4>
                    <p className="scheme-card__use">{scheme.use}</p>
                    <div className="scheme-card__footer">
                      <BadgeCheck size={13} className="scheme-card__verified" />
                      <span>Official Government Portal</span>
                      <ExternalLink size={13} className="scheme-card__ext" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
