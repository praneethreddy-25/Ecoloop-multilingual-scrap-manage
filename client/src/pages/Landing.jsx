import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Home, Factory, Building2, ShieldCheck, Banknote, Smartphone, Globe } from 'lucide-react';
import ImpactStats from '../components/ImpactStats';
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();
  const portals = [
    { title: t('common.collector'), icon: <Truck className="w-8 h-8" />, to: '/collector', color: 'bg-primary text-white', desc: t('landing.collectDesc') },
    { title: t('common.household'), icon: <Home className="w-8 h-8" />, to: '/household', color: 'bg-secondary text-white', desc: t('landing.householdDesc') },
    { title: t('common.recycler'), icon: <Factory className="w-8 h-8" />, to: '/recycler', color: 'bg-accent text-white', desc: t('landing.recyclerDesc') },
    { title: t('common.municipality'), icon: <Building2 className="w-8 h-8" />, to: '/municipality', color: 'bg-purple-600 text-white', desc: t('landing.municipalityDesc') }
  ];

  return (
    <div className="space-y-16 py-8">
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block p-4 bg-green-50 rounded-full mb-4">
          <Globe className="w-12 h-12 text-primary mx-auto" />
        </motion.div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          {t('landing.title')}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          {t('landing.subtitle')}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">{t('landing.selectPortal')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portals.map((p, i) => (
            <motion.div key={i} whileHover={{ y: -5 }}>
              <Link to={p.to} className={`block p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all ${p.color}`}>
                <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
                <p className="text-white/80">{p.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-8">{t('landing.collectiveImpact')}</h2>
        <ImpactStats ewasteDiverted={45200} co2Avoided={31000} batteries={8500} />
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto pt-8">
        <div>
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-2">{t('landing.fairValueAi')}</h3>
          <p className="text-gray-500 text-sm">{t('landing.fairValueDesc')}</p>
        </div>
        <div>
          <div className="mx-auto w-16 h-16 bg-green-50 text-primary rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-2">{t('landing.offlineFirst')}</h3>
          <p className="text-gray-500 text-sm">{t('landing.offlineDesc')}</p>
        </div>
        <div>
          <div className="mx-auto w-16 h-16 bg-yellow-50 text-accent rounded-full flex items-center justify-center mb-4">
            <Banknote className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-2">{t('landing.digitalLedger')}</h3>
          <p className="text-gray-500 text-sm">{t('landing.ledgerDesc')}</p>
        </div>
      </section>
    </div>
  );
}
