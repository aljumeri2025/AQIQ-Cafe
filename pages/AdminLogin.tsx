
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (password === 'admin123') {
      localStorage.setItem('aqiq_admin_auth', 'true');
      navigate('/admin');
    } else {
      alert('Incorrect password. Try "admin123"');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-serif text-aqiq-primary mb-6 text-center rtl:font-arabic">{t('admin_login_title')}</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-aqiq-primary focus:border-aqiq-primary"
              placeholder={t('placeholder_password')}
            />
          </div>
          <Button type="submit" className="w-full">{t('btn_access')}</Button>
        </form>
      </div>
    </div>
  );
};
