'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'gu' | 'pa' | 'ur';

export interface Language {
  code: LanguageCode;
  shortCode: string;
  name: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', shortCode: 'EN', name: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'hi', shortCode: 'HI', name: 'हिंदी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'bn', shortCode: 'BN', name: 'বাংলা', englishName: 'Bengali', dir: 'ltr' },
  { code: 'mr', shortCode: 'MR', name: 'मराठी', englishName: 'Marathi', dir: 'ltr' },
  { code: 'gu', shortCode: 'GU', name: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr' },
  { code: 'pa', shortCode: 'PA', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', dir: 'ltr' },
  { code: 'ur', shortCode: 'UR', name: 'اردو', englishName: 'Urdu', dir: 'rtl' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: LanguageCode) => void;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'numberlive_lang';
const COOKIE_KEY = 'numberlive_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentCode, setCurrentCode] = useState<LanguageCode>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage / cookie
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setCurrentCode(stored);
        document.documentElement.lang = stored;
        const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === stored);
        document.documentElement.dir = langObj?.dir || 'ltr';
      } else {
        // Check cookie
        const match = document.cookie.match(new RegExp('(^| )' + COOKIE_KEY + '=([^;]+)'));
        if (match && SUPPORTED_LANGUAGES.some((l) => l.code === match[2])) {
          const cookieLang = match[2] as LanguageCode;
          setCurrentCode(cookieLang);
          document.documentElement.lang = cookieLang;
          const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === cookieLang);
          document.documentElement.dir = langObj?.dir || 'ltr';
        }
      }
    } catch (e) {
      console.warn('Could not read saved language preference', e);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (!langObj) return;

    setCurrentCode(code);

    try {
      localStorage.setItem(STORAGE_KEY, code);
      document.cookie = `${COOKIE_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = code;
      document.documentElement.dir = langObj.dir;
    } catch (e) {
      console.warn('Could not persist language preference', e);
    }
  }, []);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLanguage: SUPPORTED_LANGUAGES[0],
      setLanguage: () => {},
      languages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
