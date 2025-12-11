import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const DrinksMenuPage: React.FC = () => {
  const { t } = useLanguage();

  const categories = [
    {
      title: t('category_hot'),
      items: [
        { name: t('item_espresso'), price: 12 },
        { name: t('item_cortado'), price: 16 },
        { name: t('item_flatwhite'), price: 18 },
        { name: t('item_cappuccino'), price: 20 },
        { name: t('item_latte'), price: 22 },
        { name: t('item_spanish'), price: 24 },
        { name: t('item_v60'), price: 22 },
      ]
    },
    {
      title: t('category_cold'),
      items: [
        { name: t('item_iced_latte'), price: 24 },
        { name: t('item_cold_brew'), price: 26 },
        { name: t('item_spanish'), price: 26 },
      ]
    },
    {
      title: t('category_tea'),
      items: [
        { name: t('item_matcha'), price: 26 },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold text-center text-aqiq-primary mb-12 rtl:font-arabic">
        {t('menu_drinks_title')}
      </h1>

      <div className="space-y-12">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-aqiq-primary">
            <h2 className="text-2xl font-bold mb-6 text-aqiq-accent pb-2 border-b border-gray-100 rtl:font-arabic">{cat.title}</h2>
            <ul className="space-y-4">
              {cat.items.map((item, i) => (
                <li key={i} className="flex justify-between items-center text-lg group">
                  <span className="font-medium text-gray-800 group-hover:text-aqiq-primary transition">{item.name}</span>
                  <div className="flex-grow mx-4 border-b border-dotted border-gray-300 relative top-1"></div>
                  <span className="font-bold text-aqiq-primary font-mono">{item.price} {t('price_sar')}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};