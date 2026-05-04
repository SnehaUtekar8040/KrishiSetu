import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LayoutDashboard, LogOut, Globe } from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();

  const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'ur', name: 'اردو' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'as', name: 'অসমীয়া' }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    // Check login status on every route change
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/auth');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-nav">
      <div className="navbar__container container">
        <Link to="/" className="navbar__logo" id="logo-link">
          <div className="navbar__logo-icon">
            <Leaf size={22} />
          </div>
          <span className="navbar__logo-text">KrishiSetu</span>
        </Link>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`} id="nav-home">
            {t('Home')}
          </Link>
          <Link to="/predict" className={`navbar__link ${location.pathname === '/predict' ? 'navbar__link--active' : ''}`} id="nav-predict">
            {t('Crop Predictor')}
          </Link>
          <a href="#about" className="navbar__link" id="nav-about">{t('About Us')}</a>
          <a href="#contact" className="navbar__link" id="nav-contact">{t('Contact')}</a>
        </div>

        <div className="navbar__right">
          <div className="navbar__lang-selector">
            <Globe size={16} />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="navbar__lang-select"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="navbar__dashboard-btn" id="nav-dashboard">
                <LayoutDashboard size={16} />
                {t('Dashboard')}
              </Link>
              <button className="navbar__logout-btn" onClick={handleLogout} id="nav-logout">
                <LogOut size={15} />
                {t('Logout')}
              </button>
            </>
          ) : (
            <Link to="/auth" className="navbar__cta" id="nav-cta">
              {t('Login / Sign Up')}
            </Link>
          )}
        </div>

        <button
          className="navbar__menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-menu-toggle"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
