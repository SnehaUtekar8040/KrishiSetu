import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-nav">
      <div className="navbar__container container">
        <Link to="/" className="navbar__logo" id="logo-link">
          <div className="navbar__logo-icon">
            <Leaf size={22} />
          </div>
          <span className="navbar__logo-text">KrishiMitra</span>
        </Link>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`} id="nav-home">
            Home
          </Link>
          <Link to="/predict" className={`navbar__link ${location.pathname === '/predict' ? 'navbar__link--active' : ''}`} id="nav-predict">
            Crop Predictor
          </Link>
          <a href="#about" className="navbar__link" id="nav-about">About Us</a>
          <a href="#contact" className="navbar__link" id="nav-contact">Contact</a>
        </div>

        <Link to="/auth" className="navbar__cta" id="nav-cta">
          Login / Sign Up
        </Link>

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
