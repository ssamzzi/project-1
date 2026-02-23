"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../types';
import { translations, type TranslationKey, type TranslationMap } from '../i18n';

interface LocaleContextValue {
  locale: Locale;
  t: (key: TranslationKey, fallback?: string) => string;
  setLocale: (locale: Locale) => void;
  translation: TranslationMap;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);
const LOCALE_STORAGE_KEY = 'biolt-locale';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'en' || stored === 'ko') {
        setLocale(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocaleWithPersist = (nextLocale: Locale) => {
    setLocale(nextLocale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleWithPersist,
      translation: translations[locale],
      t: (key: TranslationKey, fallback?: string) => {
        const v = (translations[locale] as Record<string, string>)[key];
        return String(v || fallback || key);
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside <LocaleProvider>');
  }
  return ctx;
}
