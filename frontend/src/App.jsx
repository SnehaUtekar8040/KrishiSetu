import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SellPage from './pages/SellPage';
import { TranslationProvider } from './lib/TranslationContext';

// ── Protected Route: redirects to /auth if not logged in ──
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const hiddenPages = ['/auth', '/dashboard', '/sell'];
  const hideChrome = hiddenPages.includes(location.pathname);

  return (
    <>
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideChrome && <ChatBot />}
      {/* Show chatbot on dashboard too (it's used via the quick action button) */}
      {location.pathname === '/dashboard' && <ChatBot />}
    </>
  );
}

function App() {
  return (
    <TranslationProvider>
      <Router>
        <AppContent />
      </Router>
    </TranslationProvider>
  );
}

export default App;
