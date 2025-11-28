import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  // Default to Marathi ('mr') as per app theme, or load from local storage
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("messflow_language");
    return saved || "mr";
  });

  useEffect(() => {
    localStorage.setItem("messflow_language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "mr" ? "en" : "mr"));
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isMarathi: language === "mr"
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
