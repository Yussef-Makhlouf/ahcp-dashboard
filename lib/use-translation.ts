"use client";

import { useLanguage } from './language-context';
import enMessages from '../messages/en.json';
import arMessages from '../messages/ar.json';

type Messages = typeof enMessages;

export function useTranslation() {
  const { locale } = useLanguage();
  
  const messages: Messages = locale === 'ar' ? arMessages : enMessages;
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" is not a string`);
      return key;
    }
    
    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };
  
  return { t, locale };
}
