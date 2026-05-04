import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Leaf, Wheat, MapPin, Phone, PackageCheck,
  IndianRupee, CalendarDays, Search, RefreshCw, Trash2,
  ShoppingBag, Plus, Star, CheckCircle2, AlertCircle,
  Filter, ChevronDown, Store,
} from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './SellPage.css';

const CROP_OPTIONS = [
  'Rice','Wheat','Maize','Sorghum','Bajra','Barley',
  'Chickpea','Lentil','Moong Dal','Arhar (Toor Dal)','Urad Dal','Soybean',
  'Groundnut','Mustard','Sunflower','Cotton','Sugarcane','Jute',
  'Potato','Onion','Tomato','Brinjal','Capsicum','Cauliflower',
  'Cabbage','Carrot','Pea','Bitter Gourd','Bottle Gourd','Lady Finger',
  'Mango','Banana','Grapes','Pomegranate','Apple','Guava',
  'Watermelon','Muskmelon','Orange','Lemon','Turmeric','Ginger','Garlic',
];

const QUALITY_OPTS = [
  { value: 'Premium', label: '⭐ Premium',  color: '#d4861a' },
  { value: 'Good',    label: '✅ Good',      color: '#2e7d32' },
  { value: 'Fair',    label: '📦 Fair',      color: '#1565c0' },
];

const UNIT_OPTS = ['Quintal', 'Kg', 'Tonne'];

const emptyForm = {
  cropName:     '',
  quantity:     '',
  unit:         'Quintal',
  pricePerUnit: '',
  quality:      'Good',
  harvestDate:  '',
  description:  '',
};

// ─── helper: how long ago ─────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

function SellPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // ── Form state ──
  const [form, setForm]         = useState(emptyForm);
  const [submitting, setSub]    = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null); // { type:'success'|'error', text }
  const [myListings, setMyListings] = useState([]);

  // ── Marketplace state ──
  const [listings, setListings]   = useState([]);
  const [mktLoading, setMktLoad]  = useState(false);
  const [mktError, setMktError]   = useState(null);
  const [searchCrop, setSearchCrop] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [activeTab, setActiveTab] = useState('market'); // 'market' | 'mylistings'

  // ─────────────────────────────────────────────────
  // Fetch marketplace listings
  // ─────────────────────────────────────────────────
  const fetchListings = useCallback(async (crop = '', quality = '') => {
    setMktLoad(true);
    setMktError(null);
    const params = new URLSearchParams({ limit: '60' });
    if (crop)    params.set('crop', crop);
    if (quality) params.set('quality', quality);
    try {
      const r = await fetch(`http://localhost:5000/api/listings?${params}`);
      const d = await r.json();
      if (d.error) setMktError(d.error);
      else setListings(d.listings || []);
    } catch {
      setMktError('Could not connect to server.');
    } finally {
      setMktLoad(false);
    }
  }, []);

  // Fetch my own listings
  const fetchMyListings = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(`http://localhost:5000/api/listings?farmerId=${user.id}`);
      const d = await r.json();
      setMyListings(d.listings || []);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchListings('', '');
    fetchMyListings();
  }, []);

  // ─────────────────────────────────────────────────
  // Submit listing
  // ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSub(true);
    setSubmitMsg(null);
    try {
      const payload = {
        farmerId:     user.id,
        farmerName:   user.name,
        farmerPhone:  user.phone,
        village:      user.village,
        district:     user.district || '',
        state:        user.state,
        cropName:     form.cropName,
        quantity:     parseFloat(form.quantity),
        unit:         form.unit,
        pricePerUnit: parseFloat(form.pricePerUnit),
        quality:      form.quality,
        harvestDate:  form.harvestDate,
        description:  form.description,
      };
      const r = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) { setSubmitMsg({ type: 'error', text: d.error }); return; }
      setSubmitMsg({ type: 'success', text: '🎉 Your crop has been listed successfully!' });
      setForm(emptyForm);
      fetchListings(searchCrop, filterQuality);
      fetchMyListings();
    } catch {
      setSubmitMsg({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setSub(false);
    }
  };

  // ─────────────────────────────────────────────────
  // Delete listing
  // ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: user.id }),
      });
      fetchMyListings();
      fetchListings(searchCrop, filterQuality);
    } catch { /* silent */ }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(searchCrop, filterQuality);
  };

  if (!user) return null;

  return (
    <div className="sell-page" id="sell-page">
      {/* ── Page Header ── */}
      <div className="sell-page__topbar">
        <Link to="/dashboard" className="sell-back-btn" id="sell-back-btn">
          <ArrowLeft size={16} /> {t('Dashboard')}
        </Link>
        <div className="sell-page__brand">
          <Leaf size={18} />
          <span>KrishiSetu</span>
        </div>
        <div className="sell-page__user">
          <div className="sell-page__avatar">{user.name.charAt(0).toUpperCase()}</div>
          <span>{user.name}</span>
        </div>
      </div>

      {/* ── Hero Strip ── */}
      <div className="sell-hero">
        <div className="sell-hero__inner">
          <div className="sell-hero__badge"><Store size={14} /> {t('Crop Marketplace')}</div>
          <h1 className="sell-hero__title">{t('Sell Your Crop Directly to Buyers')}</h1>
          <p className="sell-hero__sub">
            {t('Post your harvest, set your price, and connect with buyers across India — no middlemen.')}
          </p>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="sell-layout">

        {/* ════════════════════════════════════════
            LEFT — Post a Listing Form
            ════════════════════════════════════════ */}
        <aside className="sell-form-panel">
          <div className="sell-panel__header">
            <Plus size={18} />
            <span>{t('Post Your Crop')}</span>
          </div>

          {/* Farmer info strip */}
          <div className="sell-farmer-strip">
            <div className="sell-farmer-strip__avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="sell-farmer-strip__name">{user.name}</p>
              <p className="sell-farmer-strip__loc">
                <MapPin size={11} /> {user.village}{user.district ? `, ${user.district}` : ''}, {user.state}
              </p>
            </div>
          </div>

          <form className="sell-form" onSubmit={handleSubmit} id="sell-form">

            {/* Crop name */}
            <div className="sell-form__group">
              <label className="sell-form__label" htmlFor="sell-crop">
                <Wheat size={14} /> {t('Crop Name')} *
              </label>
              <select
                id="sell-crop"
                className="sell-form__input"
                value={form.cropName}
                onChange={e => setForm({ ...form, cropName: e.target.value })}
                required
              >
                <option value="">— Select Crop —</option>
                {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Quantity + Unit */}
            <div className="sell-form__row">
              <div className="sell-form__group">
                <label className="sell-form__label" htmlFor="sell-qty">
                  <PackageCheck size={14} /> Quantity *
                </label>
                <input
                  id="sell-qty" type="number" min="0.1" step="0.1"
                  className="sell-form__input"
                  placeholder="e.g. 10"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="sell-form__group">
                <label className="sell-form__label" htmlFor="sell-unit">Unit</label>
                <select
                  id="sell-unit"
                  className="sell-form__input"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                >
                  {UNIT_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="sell-form__group">
              <label className="sell-form__label" htmlFor="sell-price">
                <IndianRupee size={14} /> Price per {form.unit} (₹) *
              </label>
              <input
                id="sell-price" type="number" min="1" step="1"
                className="sell-form__input"
                placeholder="e.g. 2500"
                value={form.pricePerUnit}
                onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                required
              />
            </div>

            {/* Quality */}
            <div className="sell-form__group">
              <label className="sell-form__label">
                <Star size={14} /> Quality Grade *
              </label>
              <div className="sell-quality-pills">
                {QUALITY_OPTS.map(q => (
                  <button
                    key={q.value} type="button"
                    className={`sell-quality-pill ${form.quality === q.value ? 'sell-quality-pill--active' : ''}`}
                    style={{ '--pill-color': q.color }}
                    onClick={() => setForm({ ...form, quality: q.value })}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Harvest Date */}
            <div className="sell-form__group">
              <label className="sell-form__label" htmlFor="sell-harvest">
                <CalendarDays size={14} /> Harvest Date
              </label>
              <input
                id="sell-harvest" type="date"
                className="sell-form__input"
                value={form.harvestDate}
                onChange={e => setForm({ ...form, harvestDate: e.target.value })}
              />
            </div>

            <div className="sell-form__group">
              <label className="sell-form__label" htmlFor="sell-desc">
                {t('Additional Details')}
              </label>
              <textarea
                id="sell-desc"
                className="sell-form__input sell-form__textarea"
                rows={3}
                placeholder={t("e.g. Freshly harvested, no pesticides used, available for pickup…")}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Submit */}
            {submitMsg && (
              <div className={`sell-alert sell-alert--${submitMsg.type}`} id="sell-submit-msg">
                {submitMsg.type === 'success'
                  ? <CheckCircle2 size={15} />
                  : <AlertCircle size={15} />
                }
                {submitMsg.text}
              </div>
            )}

            <button
              type="submit" id="sell-submit-btn"
              className="sell-submit-btn"
              disabled={submitting}
            >
              {submitting
                ? <><RefreshCw size={16} className="spin-anim" /> {t('Posting…')}</>
                : <><ShoppingBag size={16} /> {t('List My Crop')}</>
              }
            </button>
          </form>
        </aside>

        {/* ════════════════════════════════════════
            RIGHT — Marketplace Browse
            ════════════════════════════════════════ */}
        <section className="sell-market-panel">
          {/* Tab switcher */}
          <div className="sell-tabs">
            <button
              className={`sell-tab ${activeTab === 'market' ? 'sell-tab--active' : ''}`}
              onClick={() => setActiveTab('market')}
            >
              <Store size={15} /> {t('All Listings')}
              <span className="sell-tab__count">{listings.length}</span>
            </button>
            <button
              className={`sell-tab ${activeTab === 'mylistings' ? 'sell-tab--active' : ''}`}
              onClick={() => { setActiveTab('mylistings'); fetchMyListings(); }}
            >
              <Leaf size={15} /> {t('My Listings')}
              <span className="sell-tab__count">{myListings.length}</span>
            </button>
          </div>

          {activeTab === 'market' && (
            <>
              {/* Search bar */}
              <form className="sell-search-row" onSubmit={handleSearch} id="sell-search-form">
                <div className="sell-search-wrap">
                  <Search size={14} className="sell-search-icon" />
                  <input
                    type="text"
                    id="sell-search-input"
                    className="sell-search-input"
                    placeholder="Search crop (e.g. Wheat, Onion)…"
                    value={searchCrop}
                    onChange={e => setSearchCrop(e.target.value)}
                  />
                </div>
                <select
                  className="sell-quality-filter"
                  value={filterQuality}
                  onChange={e => setFilterQuality(e.target.value)}
                  id="sell-quality-filter"
                >
                  <option value="">All Quality</option>
                  {QUALITY_OPTS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
                <button type="submit" className="sell-search-btn" id="sell-search-btn">Search</button>
                {(searchCrop || filterQuality) && (
                  <button
                    type="button" className="sell-clear-btn"
                    onClick={() => { setSearchCrop(''); setFilterQuality(''); fetchListings('', ''); }}
                  >✕</button>
                )}
              </form>

              {/* Listings */}
              {mktLoading ? (
                <div className="sell-loading">
                  <RefreshCw size={22} className="spin-anim" />
                  <span>Loading marketplace…</span>
                </div>
              ) : mktError ? (
                <div className="sell-empty">
                  <span>⚠️ {mktError}</span>
                  <button className="sell-retry" onClick={() => fetchListings('', '')}>Retry →</button>
                </div>
              ) : listings.length === 0 ? (
                <div className="sell-empty">
                  <span>🌾 No listings yet. Be the first to sell your crop!</span>
                </div>
              ) : (
                <div className="sell-grid" id="sell-listings-grid">
                  {listings.map(l => (
                    <ListingCard key={l._id} listing={l} isOwn={l.farmerId === user.id} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'mylistings' && (
            <div>
              {myListings.length === 0 ? (
                <div className="sell-empty">
                  <span>🌿 You haven't listed any crops yet.</span>
                  <button className="sell-retry" onClick={() => setActiveTab('market')}>Browse Market →</button>
                </div>
              ) : (
                <div className="sell-grid" id="my-listings-grid">
                  {myListings.map(l => (
                    <ListingCard key={l._id} listing={l} isOwn onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Listing Card Component ───────────────────────────────────────────────────
function ListingCard({ listing: l, isOwn, onDelete }) {
  const { t } = useTranslation();
  const qualityColor = { Premium: '#d4861a', Good: '#2e7d32', Fair: '#1565c0' }[l.quality] || '#555';

  return (
    <div className={`listing-card ${isOwn ? 'listing-card--own' : ''}`} id={`listing-${l._id}`}>
      {isOwn && <div className="listing-card__own-badge">{t('Your Listing')}</div>}

      <div className="listing-card__top">
        <div className="listing-card__crop-icon">🌾</div>
        <div className="listing-card__crop-info">
          <h3 className="listing-card__crop">{l.cropName}</h3>
          <span
            className="listing-card__quality"
            style={{ color: qualityColor, borderColor: qualityColor + '33', background: qualityColor + '12' }}
          >
            {l.quality}
          </span>
        </div>
        <div className="listing-card__price">
          <span className="listing-card__price-val">₹{l.pricePerUnit.toLocaleString('en-IN')}</span>
          <span className="listing-card__price-unit">/{l.unit}</span>
        </div>
      </div>

      <div className="listing-card__details">
        <div className="listing-card__detail">
          <PackageCheck size={13} />
          <span>{l.quantity} {l.unit} available</span>
        </div>
        <div className="listing-card__detail">
          <MapPin size={13} />
          <span>{l.village}{l.district ? `, ${l.district}` : ''}, {l.state}</span>
        </div>
        <div className="listing-card__detail">
          <Phone size={13} />
          <span>+91 {l.farmerPhone}</span>
        </div>
        {l.harvestDate && (
          <div className="listing-card__detail">
            <CalendarDays size={13} />
            <span>Harvested: {new Date(l.harvestDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          </div>
        )}
      </div>

      {l.description && (
        <p className="listing-card__desc">{l.description}</p>
      )}

      <div className="listing-card__footer">
        <span className="listing-card__farmer">
          <Leaf size={11} /> {l.farmerName}
        </span>
        <span className="listing-card__time">{timeAgo(l.createdAt)}</span>
        {isOwn && (
          <button
            className="listing-card__delete"
            onClick={() => onDelete(l._id)}
            title="Remove listing"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SellPage;
