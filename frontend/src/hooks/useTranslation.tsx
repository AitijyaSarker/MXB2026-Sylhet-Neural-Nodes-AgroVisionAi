'use client'

import React, { useContext, useState, useEffect, createContext } from 'react';
import { Language } from '../../types';
import { translations } from '../../translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side rendering
    setIsClient(true);
    
    // Load saved language preference
    const savedLang = localStorage.getItem('agrovision-lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrovision-lang', newLang);
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  try {
    const context = useContext(LanguageContext);
    
    if (context !== undefined) {
      return context;
    }
  } catch (error) {
    console.error('Error accessing LanguageContext:', error);
  }
  
  // Always return a safe fallback, never throw
  const fallback = {
    lang: 'en' as Language,
    setLang: () => {},
    t: (key: string) => key,
  };
  
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ useTranslation called outside LanguageProvider. ' +
      'Make sure LanguageProvider wraps your entire app in the root layout.'
    );
  }
  
  return fallback;
};