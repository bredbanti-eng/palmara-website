"use client";

import { createContext, useContext, useState } from "react";
import { t } from "@/lib/i18n";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");
  return (
    <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  const { lang, setLang } = ctx;
  return { lang, setLang, tr: (key) => t(lang, key) };
}
