"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { detectLocale, formatDate, LOCALE_STORAGE_KEY, translate, type Locale } from "./translate";
import type { MessageKey } from "./messages/en";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  fmt: (date: Date | string, pattern: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(LOCALE_STORAGE_KEY); } catch { /* storage blocked */ }
    setLocaleState(detectLocale(stored, navigator.language));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(LOCALE_STORAGE_KEY, l); } catch { /* storage blocked */ }
  }, []);

  const value = useMemo<Ctx>(() => ({
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params),
    fmt: (date, pattern) => formatDate(date, pattern, locale),
  }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export const useT = () => useI18n().t;
