import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { label: t('nav_story'), path: '/story' },
    { label: t('nav_drinks'), path: '/menu/drinks' },
    { label: t('nav_desserts'), path: '/menu/desserts' },
    { label: t('nav_friday'), path: '/friday-gathering' },
    { label: t('nav_gallery'), path: '/gallery' },
    { label: t('nav_contact'), path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-aqiq-primary">
      {/* Navigation */}
      <nav className="bg-aqiq-primary text-aqiq-secondary py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex flex-col items-center group shrink-0">
              <h1 className="font-serif text-2xl font-bold tracking-wider group-hover:text-aqiq-light transition">AQIQ CAFÉ</h1>
              <span className="font-arabic text-xs opacity-80">على العقيق اجتمعنا</span>
            </Link>

            {/* Desktop/Tablet Menu */}
            <div className="hidden md:flex gap-4 lg:gap-6 items-center text-sm font-medium">
               {navLinks.map(link => (
                 <Link key={link.path} to={link.path} className="hover:text-aqiq-light transition hover:underline underline-offset-4 whitespace-nowrap">
                   {link.label}
                 </Link>
               ))}
            </div>

            {/* Right Side (Auth + Lang) */}
            <div className="flex gap-4 items-center text-sm">
              <button 
                onClick={toggleLanguage}
                className="hover:text-aqiq-light transition font-bold border border-aqiq-secondary/30 px-2 py-1 rounded hover:bg-white/10"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>
              
              <div className="hidden md:block">
                {!isAdmin ? (
                  <Link to="/admin" className="hover:text-aqiq-light transition underline-offset-4 hover:underline opacity-80 text-xs">{t('nav_owner_login')}</Link>
                ) : (
                    <Link to="/" className="hover:text-aqiq-light transition underline-offset-4 hover:underline">{t('nav_customer_view')}</Link>
                )}
              </div>

              {/* Mobile Menu Button - Visible only on small screens */}
              <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   {isMenuOpen ? (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   ) : (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                   )}
                 </svg>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {isMenuOpen && (
             <div className="md:hidden mt-4 pb-2 border-t border-aqiq-secondary/20 pt-4 flex flex-col gap-3 animate-fadeIn">
                {navLinks.map(link => (
                 <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-aqiq-light transition block py-1 font-medium"
                 >
                   {link.label}
                 </Link>
               ))}
               <div className="border-t border-aqiq-secondary/20 pt-2 mt-1">
                 {!isAdmin ? (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-xs opacity-70 block py-1">{t('nav_owner_login')}</Link>
                  ) : (
                      <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xs opacity-70 block py-1">{t('nav_customer_view')}</Link>
                  )}
               </div>
             </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-aqiq-primary text-aqiq-secondary py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif text-xl mb-2">Aqiq Café</p>
          <p className="font-arabic mb-4 text-lg">على العقيق اجتمعنا</p>
          
          <div className="text-sm opacity-60">
            <p>{t('footer_address')}</p>
            <p>{t('footer_open')}</p>
          </div>
          <p className="text-xs mt-8 opacity-40">© {new Date().getFullYear()} {t('footer_rights')}</p>
        </div>
      </footer>
    </div>
  );
};