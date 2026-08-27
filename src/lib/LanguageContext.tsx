"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language, type TranslationKey } from "./i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rgd_lang") as Language | null;
    if (saved === "id" || saved === "en") {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("rgd_lang", lang);
    }
  }

  function toggleLanguage() {
    const next = language === "en" ? "id" : "en";
    setLanguage(next);
  }

  function t(key: TranslationKey, fallback?: string): string {
    const dict = translations[language] || translations.en;
    return dict[key] ?? fallback ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
