
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const FridayGatheringPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="bg-aqiq-secondary p-10 rounded-full w-40 h-40 mx-auto mb-8 flex items-center justify-center shadow-inner">
         <span className="text-6xl">☕</span>
      </div>
      <h1 className="font-serif text-4xl font-bold text-aqiq-primary mb-4 rtl:font-arabic">
        {t('friday_title')}
      </h1>
      <h2 className="text-xl text-aqiq-accent mb-8 font-light italic rtl:font-arabic">
        {t('friday_subtitle')}
      </h2>
      <p className="text-gray-600 leading-relaxed text-lg rtl:font-arabic">
        {t('friday_desc')}
      </p>
      
      <div className="mt-12 p-6 bg-white rounded-lg shadow border border-gray-100 inline-block">
          <p className="font-bold text-aqiq-primary">Every Friday / كل جمعة</p>
          <p className="text-sm text-gray-500 mt-1">04:00 PM - 11:59 PM</p>
      </div>
    </div>
  );
};
