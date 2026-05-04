import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sprout, Sun, Droplets, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './HomePage.css';

const aboutCards = [
  {
    id: 'about-card-1',
    icon: 'sprout',
    iconClass: 'about__card-icon--green',
    title: 'Smart Prediction',
    desc: 'Our AI model analyzes 9 key parameters including soil nutrients, pH levels, and climate data to recommend the best crop for your specific conditions.',
  },
  {
    id: 'about-card-2',
    icon: 'sun',
    iconClass: 'about__card-icon--terra',
    title: 'AI Chatbot',
    desc: 'Get instant, personalized farming advice from our AI-powered chatbot. Ask questions about irrigation, pest control, seasonal planting, and more.',
  },
  {
    id: 'about-card-3',
    icon: 'droplets',
    iconClass: 'about__card-icon--brown',
    title: 'Data Driven',
    desc: 'Built on thousands of real farming data points to ensure reliable and accurate crop recommendations tailored to your region and soil type.',
  },
];

const iconMap = {
  sprout: Sprout,
  sun: Sun,
  droplets: Droplets,
};

function HomePage() {
  const { t } = useTranslation();
  const [activeCard, setActiveCard] = useState(0);

  const nextCard = useCallback(() => {
    setActiveCard((prev) => (prev + 1) % aboutCards.length);
  }, []);

  const prevCard = useCallback(() => {
    setActiveCard((prev) => (prev - 1 + aboutCards.length) % aboutCards.length);
  }, []);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(nextCard, 4000);
    return () => clearInterval(interval);
  }, [nextCard]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero__bg">
          <div className="hero__wave hero__wave--top">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="var(--sand)" d="M0,96 C360,160 720,32 1080,96 C1260,128 1380,112 1440,96 L1440,0 L0,0 Z" />
            </svg>
          </div>
          <div className="hero__wave hero__wave--bottom">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="var(--cream)" d="M0,224 C360,160 720,288 1080,224 C1260,192 1380,208 1440,224 L1440,320 L0,320 Z" />
            </svg>
          </div>
        </div>
        <div className="hero__content container">
          <div className="hero__text">
            <div className="hero__badge animate-fade-in-up">
              <Sprout size={16} />
              <span>{t('Smart Farming Solutions')}</span>
            </div>
            <h1 className="hero__title animate-fade-in-up delay-100">
              {t('Grow Smarter with')} <span className="hero__title-highlight">{t('KrishiMitra')}</span>
            </h1>
            <p className="hero__subtitle animate-fade-in-up delay-200">
              {t('Harness the power of AI to predict the perfect crop for your soil. Get personalized farming recommendations through our intelligent chatbot.')}
            </p>
            <div className="hero__actions animate-fade-in-up delay-300">
              <Link to="/predict" className="btn btn--primary" id="hero-predict-btn">
                <Sprout size={18} />
                {t('Predict Your Crop')}
              </Link>
              <a href="#about" className="btn btn--outline" id="hero-about-btn">
                {t('Learn More')}
              </a>
            </div>
            <div className="hero__stats animate-fade-in-up delay-400">
              <div className="hero__stat">
                <span className="hero__stat-number">22+</span>
                <span className="hero__stat-label">Crops Supported</span>
              </div>
              <div className="hero__stat-divider"></div>
              <div className="hero__stat">
                <span className="hero__stat-number">95%</span>
                <span className="hero__stat-label">Accuracy</span>
              </div>
              <div className="hero__stat-divider"></div>
              <div className="hero__stat">
                <span className="hero__stat-number">AI</span>
                <span className="hero__stat-label">Powered</span>
              </div>
            </div>
          </div>
          <div className="hero__image-wrapper animate-fade-in-up delay-200">
            <div className="hero__image-frame">
              <img 
                src="/farm-hero.png" 
                alt="Lush green farm field at sunrise" 
                className="hero__image"
              />
              <div className="hero__image-overlay"></div>
            </div>
            <div className="hero__floating-card hero__floating-card--1 animate-float">
              <Sun size={20} className="hero__floating-icon" />
              <span>Weather Aware</span>
            </div>
            <div className="hero__floating-card hero__floating-card--2 animate-float" style={{animationDelay: '1s'}}>
              <Droplets size={20} className="hero__floating-icon" />
              <span>Soil Analysis</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section — Card Slider */}
      <section className="about section-padding" id="about">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Leaf size={14} />
              About Us
            </span>
            <h2 className="section-title">Empowering Farmers with Technology</h2>
            <p className="section-desc">
              KrishiMitra uses advanced machine learning to analyze soil composition, weather patterns, 
              and environmental conditions to recommend the most suitable crop for your land.
            </p>
          </div>

          <div className="about-slider" id="about-slider">
              {/* Left Arrow */}
              <button className="about-slider__arrow about-slider__arrow--left" onClick={prevCard} aria-label="Previous card" id="about-prev">
                <ChevronLeft size={22} />
              </button>

              {/* Cards Track */}
              <div className="about-slider__track">
                {aboutCards.map((card, index) => {
                  const IconComponent = iconMap[card.icon];
                  let position = index - activeCard;
                  // Wrap around for circular effect
                  if (position < -1) position += aboutCards.length;
                  if (position > 1) position -= aboutCards.length;

                  return (
                    <div
                      key={card.id}
                      className={`about-slider__card ${
                        position === 0 ? 'about-slider__card--active' : ''
                      } ${
                        Math.abs(position) === 1 ? 'about-slider__card--side' : ''
                      } ${
                        Math.abs(position) > 1 ? 'about-slider__card--hidden' : ''
                      }`}
                      style={{
                        '--offset': position,
                      }}
                      onClick={() => setActiveCard(index)}
                      id={card.id}
                    >
                      <div className="about-slider__card-inner">
                        <div className={`about__card-icon ${card.iconClass}`}>
                          <IconComponent size={32} />
                        </div>
                        <h3>{card.title}</h3>
                        <p>{card.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Arrow */}
              <button className="about-slider__arrow about-slider__arrow--right" onClick={nextCard} aria-label="Next card" id="about-next">
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Navigation Dots */}
            <div className="about-slider__dots" id="about-dots">
              {aboutCards.map((card, index) => (
                <button
                  key={card.id}
                  className={`about-slider__dot ${index === activeCard ? 'about-slider__dot--active' : ''}`}
                  onClick={() => setActiveCard(index)}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works section-padding" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Sprout size={14} />
              How It Works
            </span>
            <h2 className="section-title">Three Simple Steps</h2>
            <p className="section-desc">
              Getting the right crop recommendation is just three steps away
            </p>
          </div>

          <div className="steps">
            <div className="step" id="step-1">
              <div className="step__number">01</div>
              <div className="step__content">
                <h3>Enter Soil Data</h3>
                <p>Provide your soil parameters — Nitrogen, Phosphorous, Potassium, Carbon, pH value, and soil type.</p>
              </div>
            </div>
            <div className="step__connector">
              <div className="step__connector-line"></div>
            </div>
            <div className="step" id="step-2">
              <div className="step__number">02</div>
              <div className="step__content">
                <h3>Add Climate Info</h3>
                <p>Enter the temperature, humidity, and rainfall data for your area for a more accurate prediction.</p>
              </div>
            </div>
            <div className="step__connector">
              <div className="step__connector-line"></div>
            </div>
            <div className="step" id="step-3">
              <div className="step__number">03</div>
              <div className="step__content">
                <h3>Get Recommendation</h3>
                <p>Our AI analyzes your data and suggests the most suitable crop to maximize your yield and profit.</p>
              </div>
            </div>
          </div>

          <div className="how-it-works__cta">
            <Link to="/predict" className="btn btn--primary btn--lg" id="try-now-btn">
              <Sprout size={20} />
              Try It Now — Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section (Our Produce style) */}
      <section className="features section-padding" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Leaf size={14} />
              Features
            </span>
            <h2 className="section-title">What We Offer</h2>
          </div>

          <div className="features__grid">
            <div className="feature-card feature-card--large" id="feature-predict">
              <div className="feature-card__content">
                <h3>Crop Prediction Engine</h3>
                <p>Powered by Random Forest ML model trained on real agricultural datasets. Supports 22+ crop types with 95% accuracy.</p>
                <Link to="/predict" className="feature-card__link">
                  Start Predicting →
                </Link>
              </div>
              <div className="feature-card__visual">
                <div className="feature-card__icon-grid">
                  <div className="feature-card__mini-icon">🌾</div>
                  <div className="feature-card__mini-icon">🌽</div>
                  <div className="feature-card__mini-icon">🍚</div>
                  <div className="feature-card__mini-icon">☕</div>
                  <div className="feature-card__mini-icon">🥭</div>
                  <div className="feature-card__mini-icon">🍇</div>
                </div>
              </div>
            </div>
            <div className="feature-card" id="feature-chat">
              <div className="feature-card__content">
                <h3>AI Farming Assistant</h3>
                <p>Chat with our AI bot for personalized tips on crop care, pest management, and modern farming techniques.</p>
              </div>
            </div>
            <div className="feature-card" id="feature-soil">
              <div className="feature-card__content">
                <h3>Soil Analysis</h3>
                <p>Analyze NPK, Carbon, pH and soil type to understand your land's potential and optimize crop selection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact section-padding" id="contact">
        <div className="container">
          <div className="contact__wrapper">
            <div className="contact__info">
              <span className="section-tag section-tag--light">
                <Mail size={14} />
                Get In Touch
              </span>
              <h2 className="contact__title">Have Questions? Reach Out</h2>
              <p className="contact__desc">
                We're here to help farmers make better decisions. Contact us for any queries about our platform.
              </p>
              <div className="contact__items">
                <div className="contact__item">
                  <Mail size={18} />
                  <span>support@krishimitra.com</span>
                </div>
                <div className="contact__item">
                  <Phone size={18} />
                  <span>+91 98765 43210</span>
                </div>
                <div className="contact__item">
                  <MapPin size={18} />
                  <span>India</span>
                </div>
              </div>
            </div>
            <div className="contact__form-wrapper">
              <form className="contact__form" id="contact-form" onSubmit={(e) => e.preventDefault()}>
                <div className="contact__form-group">
                  <label htmlFor="contact-name">Name</label>
                  <input type="text" id="contact-name" placeholder="Your name" />
                </div>
                <div className="contact__form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input type="email" id="contact-email" placeholder="your@email.com" />
                </div>
                <div className="contact__form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" rows="4" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="btn btn--primary" id="contact-submit">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer__content">
            <div className="footer__brand">
              <div className="footer__logo">
                <div className="navbar__logo-icon">
                  <Leaf size={18} />
                </div>
                <span>KrishiMitra</span>
              </div>
              <p>Empowering farmers with AI-driven crop recommendations for a sustainable future.</p>
            </div>
            <div className="footer__links">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <Link to="/predict">Crop Predictor</Link>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer__links">
              <h4>Features</h4>
              <a href="#features">Crop Prediction</a>
              <a href="#features">AI Chatbot</a>
              <a href="#features">Soil Analysis</a>
            </div>
          </div>
          <div className="footer__bottom">
            <p>© 2026 KrishiMitra. Built with ❤️ for Indian Farmers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
