import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'en');
  const [translations, setTranslations] = useState({});
  const queueRef = useRef(new Set());
  const timerRef = useRef(null);

  // When language changes, clear translations and save to localStorage
  useEffect(() => {
    localStorage.setItem('app_language', language);
    if (language === 'en') {
      setTranslations({});
      return;
    }
  }, [language]);

  const processQueue = async () => {
    if (queueRef.current.size === 0 || language === 'en') return;

    const textsToTranslate = Array.from(queueRef.current);
    queueRef.current.clear();

    try {
      const res = await fetch('http://localhost:5000/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          target_language: language
        })
      });

      const data = await res.json();
      if (data.translations) {
        setTranslations(prev => ({
          ...prev,
          ...data.translations
        }));
      }
    } catch (err) {
      console.error('Translation batch failed', err);
    }
  };

  const t = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (language === 'en') return text;

    if (translations[text]) {
      return translations[text];
    }

    // Add to queue if not translated yet and not already in queue
    if (!queueRef.current.has(text)) {
      queueRef.current.add(text);
      
      // Debounce the API call
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(processQueue, 150);
    }

    return text; // Return original while translating
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
