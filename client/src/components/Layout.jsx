import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import OfflineBanner from './OfflineBanner';
import useStore from '../store/useStore';
import { Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Layout({ children }) {
  const { isOnline } = useStore();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <span className="text-xl font-bold text-primary">ECOLOOP</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        <OfflineBanner />
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 fixed bottom-0 w-full md:hidden z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/" className="p-2 text-gray-500 hover:text-primary">{t('common.home')}</Link>
          <Link to="/collector" className="p-2 text-gray-500 hover:text-primary">{t('common.collector')}</Link>
          <Link to="/household" className="p-2 text-gray-500 hover:text-primary">{t('common.household')}</Link>
        </div>
      </footer>
    </div>
  );
}
