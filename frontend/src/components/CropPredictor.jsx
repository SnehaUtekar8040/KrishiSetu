import { useState } from 'react';
import { Sprout, Loader2, Thermometer, Droplets, CloudRain, TestTubes, Atom, Leaf, FlaskConical } from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';
import './CropPredictor.css';

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

function CropPredictor({ onPredictionSuccess }) {
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
      const response = await fetch('http://localhost:5000/api/predict', {
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
        
        if (onPredictionSuccess) onPredictionSuccess();
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
    <div className="crop-predictor">
      <div className="widget__header">
        <Sprout size={20} />
        <span>{t('AI Crop Predictor')}</span>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="predictor-form">
          <div className="predictor-grid">
            {fields.map((field) => (
              <div key={field.name} className="input-group">
                <label className="input-label">
                  <span className="input-icon">{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  step={field.step}
                  placeholder={field.placeholder}
                  required
                  className="predictor-input"
                />
              </div>
            ))}
            <div className="input-group">
              <label className="input-label">
                <span className="input-icon"><Sprout size={18} /></span>
                {t('Soil Type')}
              </label>
              <select
                name="Soil"
                value={form.Soil}
                onChange={handleChange}
                className="predictor-input"
              >
                {SOIL_TYPES.map((type) => (
                  <option key={type} value={type}>{t(type)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="predictor-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" />
                {t('Analyzing Data...')}
              </>
            ) : (
              t('Predict Best Crop')
            )}
          </button>
          
          {error && <div className="predictor-error">{error}</div>}
        </form>
      ) : (
        <div className="predictor-result">
          <div className="result-card">
            <div className="result-icon">✨</div>
            <h2 className="result-title">{t('Recommended Crop')}</h2>
            <div className="result-value">{t(result)}</div>
            <p className="result-note">
              {t('Based on your soil and weather conditions, this crop is likely to give the highest yield.')}
            </p>
            <button
              onClick={() => setResult(null)}
              className="result-reset"
            >
              {t('New Prediction')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CropPredictor;
