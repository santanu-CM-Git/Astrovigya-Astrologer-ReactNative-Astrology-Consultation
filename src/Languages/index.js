import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import english from './Language/english.json';
import hindi from './Language/hindi.json';


i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: "en", // fallback language
    interpolation: {
        escapeValue: false,
    },
    resources: {
        en: english,
        hi: hindi
    },
    react: {
        useSuspense: false
    },
    compatibilityJSON: 'v3',
});
export default i18next;