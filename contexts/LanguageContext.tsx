'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    email: 'Email Address',
    mobile: 'Mobile Number',
    password: 'Password',
    loginButton: 'Sign In',
    logout: 'Logout',
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Manage maternal and infant health efficiently'
    },
    mothers: {
      title: 'Mothers',
      addNew: 'Add New Mother'
    },
    children: {
      title: 'Children',
      addNew: 'Add New Child'
    },
    routes: {
      title: 'Routes & Visits'
    },
    common: {
      all: 'All',
      search: 'Search...',
      filter: 'Filter',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete'
    },
    risk: {
      high: 'High Risk',
      medium: 'Medium Risk',
      low: 'Low Risk'
    },
    age: {
      '0to6months': '0-6 months',
      '6to12months': '6-12 months',
      '1to2years': '1-2 years',
      '2to5years': '2-5 years'
    }
  },
  ml: {
    welcome: 'സ്വാഗതം',
    login: 'ലോഗിൻ',
    email: 'ഇമെയിൽ വിലാസം',
    mobile: 'മൊബൈൽ നമ്പർ',
    password: 'പാസ്‌വേഡ്',
    loginButton: 'സൈൻ ഇൻ',
    logout: 'ലോഗ് ഔട്ട്',
    dashboard: {
      title: 'ഡാഷ്ബോർഡ്',
      subtitle: 'മാതൃ-ശിശു ആരോഗ്യം കാര്യക്ഷമമായി കൈകാര്യം ചെയ്യുക'
    },
    mothers: {
      title: 'അമ്മമാർ',
      addNew: 'പുതിയ അമ്മ ചേർക്കുക'
    },
    children: {
      title: 'കുട്ടികൾ',
      addNew: 'പുതിയ കുട്ടി ചേർക്കുക'
    },
    routes: {
      title: 'റൂട്ടുകളും സന്ദർശനങ്ങളും'
    },
    common: {
      all: 'എല്ലാം',
      search: 'തിരയുക...',
      filter: 'ഫിൽട്ടർ',
      save: 'സേവ് ചെയ്യുക',
      cancel: 'റദ്ദാക്കുക',
      edit: 'എഡിറ്റ് ചെയ്യുക',
      delete: 'ഡിലീറ്റ് ചെയ്യുക'
    },
    risk: {
      high: 'ഉയർന്ന അപകടസാധ്യത',
      medium: 'ഇടത്തരം അപകടസാധ്യത',
      low: 'കുറഞ്ഞ അപകടസാധ്യത'
    },
    age: {
      '0to6months': '0-6 മാസം',
      '6to12months': '6-12 മാസം',
      '1to2years': '1-2 വർഷം',
      '2to5years': '2-5 വർഷം'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('babyassist_language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ml')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('babyassist_language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}