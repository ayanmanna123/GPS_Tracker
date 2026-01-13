// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "./locales/en.json";
import hiTranslations from "./locales/hi.json";
import taTranslations from "./locales/ta.json";
import teTranslations from "./locales/te.json";
import knTranslations from "./locales/kn.json";
import mlTranslations from "./locales/ml.json";
import bnTranslations from "./locales/bn.json";
import guTranslations from "./locales/gu.json";
import mrTranslations from "./locales/mr.json";
import paTranslations from "./locales/pa.json";
import urTranslations from "./locales/ur.json";
import asTranslations from "./locales/as.json";
import ksTranslations from "./locales/ks.json";
import neTranslations from "./locales/ne.json";
import satTranslations from "./locales/sat.json";
import sdTranslations from "./locales/sd.json";
import orTranslations from "./locales/or.json";
import mniTranslations from "./locales/mni.json";
import kokTranslations from "./locales/kok.json";

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  ta: { translation: taTranslations },
  te: { translation: teTranslations },
  kn: { translation: knTranslations },
  ml: { translation: mlTranslations },
  bn: { translation: bnTranslations },
  gu: { translation: guTranslations },
  mr: { translation: mrTranslations },
  pa: { translation: paTranslations },
  ur: { translaneon: urTranslations },
  kok: { translation: kokTranslations },
  or: { translation: orTranslations },
  ne: { translation: neTranslations },
  sat: { translation: satTranslations },
  sd: { translation: sdTranslations },
  mni: { translation: mniTranslations },
  ks: { translation: ksTranslations },
  as: { translation: asTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: localStorage.getItem("selectedLanguage") || "en",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
