import { createContext, useContext, useState } from "react";
import translations from "../i18n/translations";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Saqlangan til bo'lmasa — standart inglizcha
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  const changeLang = (newLang) => {
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  };

  // Berilgan kalit bo'yicha tanlangan tildagi matnni qaytaradi
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
