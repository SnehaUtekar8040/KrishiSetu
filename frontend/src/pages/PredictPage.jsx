import { useState } from 'react';
import { Sprout, Loader2, ArrowLeft, Thermometer, Droplets, CloudRain, TestTubes, Atom, Leaf, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/TranslationContext';
import { API_BASE_URL } from '../config';
import './PredictPage.css';

const SOIL_TYPES = ['Loamy Soil', 'Peaty Soil', 'Sandy Soil', 'Clay Soil'];

const initialForm = {
  Temperature: '',
  Humidity: '',
  Rainfall: '',
  PH: '',
  Nitrogen: '',
  Phosphorous: '',
  Potassium: '',
  Carbon: '',
  Soil: 'Loamy Soil',
};

function PredictPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Temperature: parseFloat(form.Temperature),
          Humidity: parseFloat(form.Humidity),
          Rainfall: parseFloat(form.Rainfall),
          PH: parseFloat(form.PH),
          Nitrogen: parseInt(form.Nitrogen),
          Phosphorous: parseInt(form.Phosphorous),
          Potassium: parseInt(form.Potassium),
          Carbon: parseFloat(form.Carbon),
          Soil: form.Soil,
        }),
      });

      const data = await response.json();
      if (data.prediction) {
        setResult(data.prediction);
        // ── Save to prediction history ──
        const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
        history.push({
          crop: data.prediction,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          soil: form.Soil,
          temp: form.Temperature,
        });
        localStorage.setItem('predictionHistory', JSON.stringify(history));
      } else {
        setError(data.error || 'Prediction failed. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'Temperature', label: t('Temperature (°C)'), icon: <Thermometer size={18} />, type: 'number', step: '0.1', placeholder: t('e.g. 25.5') },
    { name: 'Humidity', label: t('Humidity (%)'), icon: <Droplets size={18} />, type: 'number', step: '0.1', placeholder: t('e.g. 80') },
    { name: 'Rainfall', label: t('Rainfall (mm)'), icon: <CloudRain size={18} />, type: 'number', step: '0.1', placeholder: t('e.g. 200') },
    { name: 'PH', label: t('pH Value'), icon: <TestTubes size={18} />, type: 'number', step: '0.01', placeholder: t('e.g. 6.5') },
    { name: 'Nitrogen', label: t('Nitrogen (N)'), icon: <Atom size={18} />, type: 'number', step: '1', placeholder: t('e.g. 40') },
    { name: 'Phosphorous', label: t('Phosphorous (P)'), icon: <Leaf size={18} />, type: 'number', step: '1', placeholder: t('e.g. 60') },
    { name: 'Potassium', label: t('Potassium (K)'), icon: <FlaskConical size={18} />, type: 'number', step: '1', placeholder: t('e.g. 45') },
    { name: 'Carbon', label: t('Carbon'), icon: <Atom size={18} />, type: 'number', step: '0.01', placeholder: t('e.g. 2.5') },
  ];

  return (
    <div className="predict-page">
      <div className="predict-page__bg"></div>
      <div className="container predict-page__container">
        <Link to="/" className="predict-page__back" id="predict-back-btn">
          <ArrowLeft size={18} />
          {t('Back to Home')}
        </Link>

        <div className="predict-page__header">
          <div className="predict-page__badge">
            <Sprout size={16} />
            {t('AI Crop Predictor')}
          </div>
          <h1 className="predict-page__title">{t('Find the Perfect Crop for Your Land')}</h1>
          <p className="predict-page__subtitle">
            {t('Enter your soil and climate parameters below. Our machine learning model will analyze the data and suggest the most suitable crop.')}
          </p>
        </div>

        <form className="predict-form" onSubmit={handleSubmit} id="predict-form">
          <div className="predict-form__grid">
            {fields.map((field) => (
              <div className="predict-form__group" key={field.name}>
                <label htmlFor={`predict-${field.name}`} className="predict-form__label">
                  {field.icon}
                  {field.label}
                </label>
                <input
                  id={`predict-${field.name}`}
                  name={field.name}
                  type={field.type}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  className="predict-form__input"
                />
              </div>
            ))}
            <div className="predict-form__group predict-form__group--full">
              <label htmlFor="predict-Soil" className="predict-form__label">
                <Sprout size={18} />
                {t('Soil Type')}
              </label>
              <select
                id="predict-Soil"
                name="Soil"
                value={form.Soil}
                onChange={handleChange}
                className="predict-form__input predict-form__select"
              >
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary btn--lg predict-form__submit"
            id="predict-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" />
                {t('Analyzing...')}
              </>
            ) : (
              <>
                <Sprout size={20} />
                {t('Predict Crop')}
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="predict-result animate-fade-in-up" id="predict-result">
            <div className="predict-result__icon">🌾</div>
            <h2 className="predict-result__title">{t('Recommended Crop')}</h2>
            <p className="predict-result__crop">{t(result)}</p>
            <p className="predict-result__desc">
              {t('Based on your soil and climate data, our AI recommends growing')} <strong>{t(result)}</strong> {t('for maximum yield.')}
            </p>
          </div>
        )}

        {error && (
          <div className="predict-error animate-fade-in-up" id="predict-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictPage;
