"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('ar'); // Default to Arabic
  const [isRTL, setIsRTL] = useState(true);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');

  useEffect(() => {
    // Load saved language from localStorage
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('ahcp-locale');
      if (savedLocale && ['ar', 'en'].includes(savedLocale)) {
        setLocale(savedLocale);
      }
    }
  }, []);

  useEffect(() => {
    // Update RTL and direction based on locale
    const newIsRTL = locale === 'ar';
    const newDirection = newIsRTL ? 'rtl' : 'ltr';
    
    setIsRTL(newIsRTL);
    setDirection(newDirection);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ahcp-locale', locale);
      
      // Update document attributes
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', newDirection);
      
      // Update body class for RTL/LTR styling
      document.body.classList.remove('rtl', 'ltr');
      document.body.classList.add(newDirection);
    }
  }, [locale]);

  const handleSetLocale = (newLocale: string) => {
    if (['ar', 'en'].includes(newLocale)) {
      setLocale(newLocale);
    }
  };

  return (
    <LanguageContext.Provider value={{
      locale,
      setLocale: handleSetLocale,
      isRTL,
      direction
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
