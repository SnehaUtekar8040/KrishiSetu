import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, Phone, User, X, Search } from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './VendorDashboard.css';

function VendorDashboard({ user, onLogout }) {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [greeting, setGreeting] = useState('');

  // Filter states
  const [cropFilter, setCropFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchListings();
  }, []);

  const fetchListings = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/listings')
      .then(r => r.json())
      .then(d => {
        setListings(d.listings || []);
      })
      .catch(e => setError('Failed to fetch listings'))
      .finally(() => setLoading(false));
  };

  const filteredListings = listings.filter(listing => {
    const matchCrop = !cropFilter || listing.cropName.toLowerCase().includes(cropFilter.toLowerCase());
    const locStr = `${listing.village || ''} ${listing.district || ''} ${listing.state || ''}`.toLowerCase();
    const matchLoc = !locationFilter || locStr.includes(locationFilter.toLowerCase());
    return matchCrop && matchLoc;
  });

  return (
    <div className="vendor-dashboard">
      {/* ── Top Header ── */}
      <header className="vendor-header">
        <div className="vendor-header__info">
          <p className="vendor-greeting">{t(greeting)}, 👋</p>
          <h1 className="vendor-name">{user.name}</h1>
          <p className="vendor-location">
            <MapPin size={14} /> {user.location} | {t('Mandi')}: {user.mandiLocation}
          </p>
        </div>
        <button className="vendor-logout-btn" onClick={onLogout}>
          <LogOut size={16} /> {t('Sign Out')}
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="vendor-main">
        <div className="vendor-section-title">
          <h2>{t('Available Crops for Sale')}</h2>
          <span className="vendor-badge">{listings.length} {t('Listings')}</span>
        </div>

        {/* ── Filters ── */}
        <div className="vendor-filters">
          <div className="vendor-filter-group">
            <Search size={16} />
            <input 
              type="text" 
              placeholder={t("Search by crop...")}
              value={cropFilter}
              onChange={e => setCropFilter(e.target.value)}
            />
          </div>
          <div className="vendor-filter-group">
            <MapPin size={16} />
            <input 
              type="text" 
              placeholder={t("Search by location...")}
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="vendor-loading">{t('Loading crops...')}</div>
        ) : error ? (
          <div className="vendor-error">{t(error)}</div>
        ) : listings.length === 0 ? (
          <div className="vendor-empty">{t('No crops currently available.')}</div>
        ) : filteredListings.length === 0 ? (
          <div className="vendor-empty">{t('No crops match your filters.')}</div>
        ) : (
          <div className="vendor-grid">
            {filteredListings.map(listing => (
              <div 
                key={listing._id} 
                className="vendor-card"
                onClick={() => setSelectedListing(listing)}
              >
                <div className="vendor-card__top">
                  <div className="vendor-card__crop-icon">🌾</div>
                  <div className="vendor-card__crop-details">
                    <h3 className="vendor-card__crop-name">{listing.cropName}</h3>
                    <span className="vendor-card__quality">{t('Quality')}: {listing.quality}</span>
                  </div>
                </div>
                <div className="vendor-card__body">
                  <div className="vendor-card__price">
                    <span className="vendor-card__price-label">{t('Price')}</span>
                    <span className="vendor-card__price-val">₹{listing.pricePerUnit} / {listing.unit}</span>
                  </div>
                  <div className="vendor-card__qty">
                    <span className="vendor-card__qty-label">{t('Quantity')}</span>
                    <span className="vendor-card__qty-val">{listing.quantity} {listing.unit}</span>
                  </div>
                </div>
                <div className="vendor-card__footer">
                  <MapPin size={14} /> 
                  <span>{listing.village}, {listing.state}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Details Modal ── */}
      {selectedListing && (
        <div className="vendor-modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="vendor-modal" onClick={e => e.stopPropagation()}>
            <button className="vendor-modal__close" onClick={() => setSelectedListing(null)}>
              <X size={20} />
            </button>
            <div className="vendor-modal__header">
              <h2>{t('Crop Details')}</h2>
            </div>
            <div className="vendor-modal__content">
              <div className="vendor-modal__crop-info">
                <h3>{selectedListing.cropName}</h3>
                <div className="vendor-modal__grid">
                  <div className="vendor-modal__grid-item">
                    <span>{t('Quantity')}:</span>
                    <strong>{selectedListing.quantity} {selectedListing.unit}</strong>
                  </div>
                  <div className="vendor-modal__grid-item">
                    <span>{t('Price')}:</span>
                    <strong>₹{selectedListing.pricePerUnit} / {selectedListing.unit}</strong>
                  </div>
                  <div className="vendor-modal__grid-item">
                    <span>{t('Quality')}:</span>
                    <strong>{selectedListing.quality}</strong>
                  </div>
                  <div className="vendor-modal__grid-item">
                    <span>{t('Harvest Date')}:</span>
                    <strong>{selectedListing.harvestDate || t('Not specified')}</strong>
                  </div>
                </div>
                {selectedListing.description && (
                  <div className="vendor-modal__desc">
                    <span>{t('Description')}:</span>
                    <p>{selectedListing.description}</p>
                  </div>
                )}
              </div>

              <div className="vendor-modal__farmer-info">
                <h3>{t('Farmer Information')}</h3>
                <div className="farmer-info-list">
                  <div className="farmer-info-item">
                    <User size={16} /> <span>{selectedListing.farmerName}</span>
                  </div>
                  <div className="farmer-info-item">
                    <Phone size={16} /> <span>+91 {selectedListing.farmerPhone}</span>
                  </div>
                  <div className="farmer-info-item">
                    <MapPin size={16} /> 
                    <span>
                      {selectedListing.village}
                      {selectedListing.district ? `, ${selectedListing.district}` : ''}, 
                      {selectedListing.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="vendor-modal__actions">
              <a href={`tel:+91${selectedListing.farmerPhone}`} className="vendor-modal__call-btn">
                <Phone size={16} /> {t('Call Farmer')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;
