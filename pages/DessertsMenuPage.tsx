import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const DessertsMenuPage: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    { name: t('item_cheesecake'), price: 28, desc: "Classic New York style with berry compote" },
    { name: t('item_chocolate_cake'), price: 32, desc: "Rich 70% dark chocolate ganache" },
    { name: t('item_tiramisu'), price: 30, desc: "Traditional Italian recipe" },
    { name: t('item_cookies'), price: 12, desc: "Warm chocolate chip cookie" },
    { name: t('item_croissant'), price: 14, desc: "Freshly baked butter croissant" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold text-center text-aqiq-primary mb-12 rtl:font-arabic">
        {t('menu_desserts_title')}
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="grid gap-8">
            {items.map((item, i) => (
            <div key={i} className="flex justify-between items-start group p-4 rounded-lg hover:bg-gray-50 transition">
                <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <span className="font-bold text-aqiq-primary text-lg whitespace-nowrap">{item.price} {t('price_sar')}</span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};