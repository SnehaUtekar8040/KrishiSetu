import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Phone, MapPin, Lock, Eye, EyeOff, Map } from 'lucide-react';
import './AuthPage.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In form state — phone + password
  const [loginData, setLoginData] = useState({ phone: '', password: '' });

  // Sign Up form state — farmer fields
  const [signupData, setSignupData] = useState({
    name: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.phone || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(loginData.phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, village, district, state, password, confirmPassword } = signupData;
    if (!name || !phone || !village || !district || !state || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, village, district, state, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Account created! You can now sign in.');
        setError('');
        setSignupData({ name: '', phone: '', village: '', district: '', state: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess('');
        }, 1800);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="auth-page" id="auth-page">
      {/* Animated background elements */}
      <div className="auth-page__bg">
        <div className="auth-page__bg-circle auth-page__bg-circle--1"></div>
        <div className="auth-page__bg-circle auth-page__bg-circle--2"></div>
        <div className="auth-page__bg-circle auth-page__bg-circle--3"></div>
        <div className="auth-page__bg-wheat">🌾</div>
        <div className="auth-page__bg-sprout">🌱</div>
      </div>

      {/* Back to home link */}
      <Link to="/" className="auth-page__back" id="auth-back-btn">
        <Leaf size={18} />
        <span>KrishiSetu</span>
      </Link>

      {/* Main auth container */}
      <div className={`auth-container ${isSignUp ? 'auth-container--signup' : ''}`} id="auth-container">

        {/* ========== Sign Up Form ========== */}
        <div className="auth-form-panel auth-form-panel--signup" id="signup-panel">
          <form className="auth-form" onSubmit={handleSignupSubmit} id="signup-form">
            <div className="auth-form__logo">
              <Leaf size={28} />
            </div>
            <h1 className="auth-form__title">Join KrishiSetu</h1>
            <p className="auth-form__subtitle">Create your farmer account in seconds</p>

            {error && isSignUp && (
              <div className="auth-form__error" id="signup-error">{error}</div>
            )}
            {success && (
              <div className="auth-form__success" id="signup-success">{success}</div>
            )}

            {/* Full Name */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <User size={17} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={signupData.name}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-name"
                autoComplete="name"
              />
            </div>

            {/* Phone Number */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Phone size={17} />
              </div>
              <span className="auth-form__phone-prefix">+91</span>
              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                value={signupData.phone}
                onChange={handleSignupChange}
                className="auth-form__input auth-form__input--phone"
                id="signup-phone"
                maxLength={10}
                autoComplete="tel"
              />
            </div>

            {/* Village */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <MapPin size={17} />
              </div>
              <input
                type="text"
                name="village"
                placeholder="Village / Town Name"
                value={signupData.village}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-village"
                autoComplete="address-level2"
              />
            </div>

            {/* District */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Map size={17} />
              </div>
              <input
                type="text"
                name="district"
                placeholder="District Name"
                value={signupData.district}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-district"
                autoComplete="address-level1"
              />
            </div>

            {/* State */}
            <div className="auth-form__input-group auth-form__input-group--select">
              <div className="auth-form__input-icon">
                <Map size={17} />
              </div>
              <select
                name="state"
                value={signupData.state}
                onChange={handleSignupChange}
                className="auth-form__select"
                id="signup-state"
              >
                <option value="" disabled>Select Your State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Lock size={17} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create Password"
                value={signupData.password}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-form__input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Lock size={17} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-confirm-password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-form__input-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              id="signup-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-form__spinner"></span>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>

            {/* Mobile toggle */}
            <p className="auth-form__mobile-toggle">
              Already have an account?{' '}
              <button type="button" onClick={toggleMode}>Sign In</button>
            </p>
          </form>
        </div>

        {/* ========== Sign In Form ========== */}
        <div className="auth-form-panel auth-form-panel--login" id="login-panel">
          <form className="auth-form" onSubmit={handleLoginSubmit} id="login-form">
            <div className="auth-form__logo">
              <Leaf size={28} />
            </div>
            <h1 className="auth-form__title">Welcome Back</h1>
            <p className="auth-form__subtitle">Sign in to your KrishiSetu account</p>

            {error && !isSignUp && (
              <div className="auth-form__error" id="login-error">{error}</div>
            )}

            {/* Phone Number */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Phone size={17} />
              </div>
              <span className="auth-form__phone-prefix">+91</span>
              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                value={loginData.phone}
                onChange={handleLoginChange}
                className="auth-form__input auth-form__input--phone"
                id="login-phone"
                maxLength={10}
                autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Lock size={17} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="auth-form__input"
                id="login-password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-form__input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="auth-form__forgot">
              <a href="#" id="forgot-password-link">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              id="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-form__spinner"></span>
              ) : (
                'SIGN IN'
              )}
            </button>

            {/* Farmer info badge */}
            <div className="auth-form__info-badge">
              🌾 Built for Indian Farmers
            </div>

            {/* Mobile only toggle */}
            <p className="auth-form__mobile-toggle">
              Don't have an account?{' '}
              <button type="button" onClick={toggleMode}>Register</button>
            </p>
          </form>
        </div>

        {/* ========== Sliding Overlay ========== */}
        <div className="auth-overlay" id="auth-overlay">
          <div className="auth-overlay__shape">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 C40,0 60,100 100,100 L100,0 Z" className="auth-overlay__wave" />
            </svg>
          </div>
          <div className="auth-overlay__panels">
            {/* Left overlay panel — shown when signup is active */}
            <div className="auth-overlay__panel auth-overlay__panel--left" id="overlay-left">
              <div className="auth-overlay__emoji-stack">
                <span>🌾</span>
                <span>🌱</span>
                <span>🏡</span>
              </div>
              <h2>Already Registered?</h2>
              <p>Welcome back, farmer! Sign in to access crop predictions, weather insights and your personal dashboard.</p>
              <button className="auth-overlay__btn" onClick={toggleMode} id="overlay-signin-btn">
                SIGN IN
              </button>
            </div>
            {/* Right overlay panel — shown when login is active */}
            <div className="auth-overlay__panel auth-overlay__panel--right" id="overlay-right">
              <div className="auth-overlay__emoji-stack">
                <span>🌱</span>
                <span>🚜</span>
                <span>☀️</span>
              </div>
              <h2>New Farmer?</h2>
              <p>Join thousands of farmers using KrishiSetu for smarter crop decisions, soil insights, and AI-powered advice.</p>
              <button className="auth-overlay__btn" onClick={toggleMode} id="overlay-signup-btn">
                REGISTER NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
