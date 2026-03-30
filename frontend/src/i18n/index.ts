import { createElement, createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import ko, { type TranslationKey } from './ko';
import en from './en';

export type Locale = 'ko' | 'en';

const translations: Record<Locale, Record<string, string>> = { ko, en };

function detectLocale(): Locale {
  const saved = localStorage.getItem('locale');
  if (saved === 'ko' || saved === 'en') return saved;
  return navigator.language.startsWith('ko') ? 'ko' : 'en';
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>(null!);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem('locale', l);
    setLocaleState(l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      let text = translations[locale]?.[key] ?? ko[key as TranslationKey] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{{${k}}}`, String(v));
        }
      }
      return text;
    },
    [locale],
  );

  return createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { TranslationKey };
