import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './AuthPage.css';

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  // Sign Up form state
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
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
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
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
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupData.username || !signupData.email || !signupData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSignUp(false);
        setError('');
        setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="auth-page" id="auth-page">
      {/* Background elements */}
      <div className="auth-page__bg">
        <div className="auth-page__bg-circle auth-page__bg-circle--1"></div>
        <div className="auth-page__bg-circle auth-page__bg-circle--2"></div>
        <div className="auth-page__bg-circle auth-page__bg-circle--3"></div>
      </div>

      {/* Back to home link */}
      <Link to="/" className="auth-page__back" id="auth-back-btn">
        <Leaf size={18} />
        <span>KrishiMitra</span>
      </Link>

      {/* Main auth container */}
      <div className={`auth-container ${isSignUp ? 'auth-container--signup' : ''}`} id="auth-container">

        {/* ========== Sign Up Form ========== */}
        <div className="auth-form-panel auth-form-panel--signup" id="signup-panel">
          <form className="auth-form" onSubmit={handleSignupSubmit} id="signup-form">
            <h1 className="auth-form__title">Sign Up</h1>
            <p className="auth-form__subtitle">Create your farming companion account</p>

            {error && isSignUp && (
              <div className="auth-form__error" id="signup-error">{error}</div>
            )}

            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <User size={18} />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={signupData.username}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-username"
                autoComplete="username"
              />
            </div>

            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signupData.email}
                onChange={handleSignupChange}
                className="auth-form__input"
                id="signup-email"
                autoComplete="email"
              />
            </div>

            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Lock size={18} />
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
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              id="signup-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'SIGN UP'}
            </button>

            <p className="auth-form__social-label">Or sign up with social platforms</p>
            <div className="auth-form__social-icons">
              <button type="button" className="auth-form__social-btn" id="signup-google" title="Google">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </button>
              <button type="button" className="auth-form__social-btn" id="signup-facebook" title="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button type="button" className="auth-form__social-btn" id="signup-twitter" title="Twitter">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#1DA1F2" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </button>
              <button type="button" className="auth-form__social-btn" id="signup-linkedin" title="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
            </div>

            {/* Mobile-only toggle */}
            <p className="auth-form__mobile-toggle">
              Already have an account?{' '}
              <button type="button" onClick={toggleMode}>Sign In</button>
            </p>
          </form>
        </div>

        {/* ========== Sign In Form ========== */}
        <div className="auth-form-panel auth-form-panel--login" id="login-panel">
          <form className="auth-form" onSubmit={handleLoginSubmit} id="login-form">
            <h1 className="auth-form__title">Sign In</h1>
            <p className="auth-form__subtitle">Welcome back to KrishiMitra</p>

            {error && !isSignUp && (
              <div className="auth-form__error" id="login-error">{error}</div>
            )}

            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="auth-form__input"
                id="login-email"
                autoComplete="email"
              />
            </div>

            <div className="auth-form__input-group">
              <div className="auth-form__input-icon">
                <Lock size={18} />
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              {loading ? 'Signing In...' : 'LOGIN'}
            </button>

            <p className="auth-form__social-label">Or sign in with social platforms</p>
            <div className="auth-form__social-icons">
              <button type="button" className="auth-form__social-btn" id="login-google" title="Google">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </button>
              <button type="button" className="auth-form__social-btn" id="login-facebook" title="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button type="button" className="auth-form__social-btn" id="login-twitter" title="Twitter">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#1DA1F2" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </button>
              <button type="button" className="auth-form__social-btn" id="login-linkedin" title="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
            </div>

            {/* Mobile-only toggle */}
            <p className="auth-form__mobile-toggle">
              Don't have an account?{' '}
              <button type="button" onClick={toggleMode}>Sign Up</button>
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
              <Leaf size={40} className="auth-overlay__icon" />
              <h2>New here?</h2>
              <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
              <button className="auth-overlay__btn" onClick={toggleMode} id="overlay-signup-btn">
                SIGN UP
              </button>
            </div>
            {/* Right overlay panel — shown when login is active */}
            <div className="auth-overlay__panel auth-overlay__panel--right" id="overlay-right">
              <Leaf size={40} className="auth-overlay__icon" />
              <h2>One of us?</h2>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <button className="auth-overlay__btn" onClick={toggleMode} id="overlay-login-btn">
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
