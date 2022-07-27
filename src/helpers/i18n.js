import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { TRANSLATIONS_ES } from "../dictionary/es";
import { TRANSLATIONS_FR } from "../dictionary/fr";
import { TRANSLATIONS_EN } from "../dictionary/en";

const storedLang = localStorage.getItem("i18nextLng");

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: TRANSLATIONS_EN,
      },
      es: {
        translation: TRANSLATIONS_ES,
      },
      fr: {
        translation: TRANSLATIONS_FR,
      },
    },
    caches: ["localStorage"],
  });

i18n.changeLanguage(storedLang);
