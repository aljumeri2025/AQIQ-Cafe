
import React from 'react';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-serif text-4xl font-bold text-center text-aqiq-primary mb-12 rtl:font-arabic">
        {t('contact_title')}
      </h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-aqiq-primary text-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-serif mb-6 rtl:font-arabic">Aqiq Café</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-aqiq-light text-sm uppercase tracking-wider mb-1">{t('contact_location')}</p>
              <p className="text-lg">{t('footer_address')}</p>
            </div>
            <div>
              <p className="text-aqiq-light text-sm uppercase tracking-wider mb-1">{t('contact_phone')}</p>
              <p className="text-lg font-mono" dir="ltr">+966 53 114 9111</p>
            </div>
            <div>
              <p className="text-aqiq-light text-sm uppercase tracking-wider mb-1">{t('contact_email')}</p>
              <p className="text-lg">hello@aqiqcafe.sa</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
           <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert(t('alert_msg_sent')); }}>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_name')}</label>
                  <input type="text" className="w-full p-3 border rounded focus:ring-aqiq-primary focus:border-aqiq-primary" />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('contact_message_label')}</label>
                  <textarea className="w-full p-3 border rounded h-32 focus:ring-aqiq-primary focus:border-aqiq-primary"></textarea>
              </div>
              <Button type="submit" className="w-full">{t('btn_send')}</Button>
           </form>
        </div>
      </div>
    </div>
  );
};
