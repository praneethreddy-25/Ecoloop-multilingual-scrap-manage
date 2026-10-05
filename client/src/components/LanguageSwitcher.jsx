import React from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useStore();

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <select
      value={language}
      onChange={handleLanguageChange}
      className="bg-gray-100 border-none rounded-lg px-2 py-1 text-sm outline-none"
    >
      <option value="en">🇬🇧 EN</option>
      <option value="hi">🇮🇳 HI</option>
      <option value="ta">🇮🇳 TA</option>
    </select>
  );
}
