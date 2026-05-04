import { useState, useEffect, useCallback } from 'react';
import {
  Leaf, Wheat, MapPin, Phone, PackageCheck,
  IndianRupee, CalendarDays, Search, RefreshCw, Trash2,
  ShoppingBag, Plus, Star, CheckCircle2, AlertCircle,
  Store,
} from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './Marketplace.css';

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

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

function Marketplace({ user }) {
  const { t } = useTranslation();

  const [form, setForm]         = useState(emptyForm);
  const [submitting, setSub]    = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [listings, setListings]   = useState([]);
  const [mktLoading, setMktLoad]  = useState(false);
  const [mktError, setMktError]   = useState(null);
  const [searchCrop, setSearchCrop] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [activeTab, setActiveTab] = useState('market');

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

  const fetchMyListings = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(`http://localhost:5000/api/listings?farmerId=${user.id}`);
      const d = await r.json();
      setMyListings(d.listings || []);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchListings('', '');
    fetchMyListings();
  }, [fetchListings, fetchMyListings]);

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
      setSubmitMsg({ type: 'success', text: t('🎉 Your crop has been listed successfully!') });
      setForm(emptyForm);
      fetchListings(searchCrop, filterQuality);
      fetchMyListings();
    } catch {
      setSubmitMsg({ type: 'error', text: t('Server error. Please try again.') });
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Remove this listing?'))) return;
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

  return (
    <div className="marketplace-section">
      <div className="sell-layout">
        <aside className="sell-form-panel">
          <div className="sell-panel__header">
            <Plus size={18} />
            <span>{t('Post Your Crop')}</span>
          </div>

          <form className="sell-form" onSubmit={handleSubmit}>
            <div className="sell-form__group">
              <label className="sell-form__label"><Wheat size={14} /> {t('Crop Name')} *</label>
              <select
                className="sell-form__input"
                value={form.cropName}
                onChange={e => setForm({ ...form, cropName: e.target.value })}
                required
              >
                <option value="">— {t('Select Crop')} —</option>
                {CROP_OPTIONS.map(c => <option key={c} value={c}>{t(c)}</option>)}
              </select>
            </div>

            <div className="sell-form__row">
              <div className="sell-form__group">
                <label className="sell-form__label"><PackageCheck size={14} /> {t('Quantity')} *</label>
                <input
                  type="number" min="0.1" step="0.1"
                  className="sell-form__input"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="sell-form__group">
                <label className="sell-form__label">{t('Unit')}</label>
                <select
                  className="sell-form__input"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                >
                  {UNIT_OPTS.map(u => <option key={u} value={u}>{t(u)}</option>)}
                </select>
              </div>
            </div>

            <div className="sell-form__group">
              <label className="sell-form__label"><IndianRupee size={14} /> {t('Price per')} {t(form.unit)} (₹) *</label>
              <input
                type="number" min="1" step="1"
                className="sell-form__input"
                value={form.pricePerUnit}
                onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                required
              />
            </div>

            <div className="sell-form__group">
              <label className="sell-form__label"><Star size={14} /> {t('Quality Grade')} *</label>
              <div className="sell-quality-pills">
                {QUALITY_OPTS.map(q => (
                  <button
                    key={q.value} type="button"
                    className={`sell-quality-pill ${form.quality === q.value ? 'sell-quality-pill--active' : ''}`}
                    style={{ '--pill-color': q.color }}
                    onClick={() => setForm({ ...form, quality: q.value })}
                  >
                    {t(q.label)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="sell-submit-btn"
              disabled={submitting}
            >
              {submitting ? <RefreshCw size={16} className="spin-anim" /> : <ShoppingBag size={16} />}
              {submitting ? t('Posting…') : t('List My Crop')}
            </button>
            
            {submitMsg && (
              <div className={`sell-alert sell-alert--${submitMsg.type}`}>
                {submitMsg.text}
              </div>
            )}
          </form>
        </aside>

        <section className="sell-market-panel">
          <div className="sell-tabs">
            <button
              className={`sell-tab ${activeTab === 'market' ? 'sell-tab--active' : ''}`}
              onClick={() => setActiveTab('market')}
            >
              <Store size={15} /> {t('All Listings')}
            </button>
            <button
              className={`sell-tab ${activeTab === 'mylistings' ? 'sell-tab--active' : ''}`}
              onClick={() => { setActiveTab('mylistings'); fetchMyListings(); }}
            >
              <Leaf size={15} /> {t('My Listings')}
            </button>
          </div>

          {activeTab === 'market' ? (
            <div className="sell-grid">
              {listings.map(l => (
                <ListingCard key={l._id} listing={l} isOwn={l.farmerId === user.id} onDelete={handleDelete} t={t} />
              ))}
            </div>
          ) : (
            <div className="sell-grid">
              {myListings.map(l => (
                <ListingCard key={l._id} listing={l} isOwn onDelete={handleDelete} t={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ListingCard({ listing: l, isOwn, onDelete, t }) {
  const qualityColor = { Premium: '#d4861a', Good: '#2e7d32', Fair: '#1565c0' }[l.quality] || '#555';

  return (
    <div className={`listing-card ${isOwn ? 'listing-card--own' : ''}`}>
      <div className="listing-card__top">
        <h3 className="listing-card__crop">{t(l.cropName)}</h3>
        <span className="listing-card__price">₹{l.pricePerUnit}/{t(l.unit)}</span>
      </div>
      <div className="listing-card__details">
        <div className="listing-card__detail"><PackageCheck size={13} /> {l.quantity} {t(l.unit)}</div>
        <div className="listing-card__detail"><MapPin size={13} /> {l.village}, {l.state}</div>
      </div>
      <div className="listing-card__footer">
        <span>{l.farmerName}</span>
        {isOwn && <button onClick={() => onDelete(l._id)} className="listing-card__delete"><Trash2 size={13} /></button>}
      </div>
    </div>
  );
}

export default Marketplace;
