import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en.json";
import translationTR from "./locales/tr.json";

// the translations
const resources = {
	en: {
		translation: translationEN,
	},
	tr: {
		translation: translationTR,
	},
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "tr",
		debug: import.meta.env.VITE_NODE_ENV === "development",
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});

export default i18n;
