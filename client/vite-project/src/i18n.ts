import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import urTranslation from './locales/ur.json';

const savedLanguage = typeof window !== 'undefined' ? (localStorage.getItem('lng') || 'en') : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ur: { translation: urTranslation }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document attributes globally on initialization and changes
const updateDocumentAttributes = (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lng === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }
};

updateDocumentAttributes(savedLanguage);

i18n.on('languageChanged', (lng) => {
  updateDocumentAttributes(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('lng', lng);
  }
});

export default i18n;
