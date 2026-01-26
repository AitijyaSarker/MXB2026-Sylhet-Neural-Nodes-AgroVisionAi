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
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    // Return safe fallback instead of throwing
    if (typeof window === 'undefined') {
      // Server-side: return minimal default
      return {
        lang: 'en' as Language,
        setLang: () => {},
        t: (key: string) => key,
      };
    }
    
    // Client-side: log warning but don't crash
    console.warn(
      '⚠️ useTranslation called outside LanguageProvider. ' +
      'Make sure LanguageProvider wraps your entire app in the root layout.'
    );
    
    return {
      lang: 'en' as Language,
      setLang: () => {},
      t: (key: string) => key,
    };
  }
  
  return context;
};