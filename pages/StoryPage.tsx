import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const StoryPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-aqiq-primary mb-6 rtl:font-arabic">
          {t('story_title')}
        </h1>
        <div className="w-24 h-1 bg-aqiq-accent mx-auto rounded"></div>
      </div>
      
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <div className="prose prose-lg max-w-none text-aqiq-primary leading-relaxed whitespace-pre-line font-light text-xl text-center">
          {t('story_content')}
        </div>
        
        <div className="mt-12 flex justify-center opacity-50">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-aqiq-accent">
               <path d="M2 21h19a1 1 0 0 0 1-1v-5.428a1 1 0 0 0-.293-.707l-6-6a1 1 0 0 0-1.414 0l-3.293 3.293-1.293-1.293a1 1 0 0 0-1.414 0l-5 5A1 1 0 0 0 3 15.572V20a1 1 0 0 0 1 1zm5-5.586l3.293-3.293 1.293 1.293a1 1 0 0 0 1.414 0L17.586 9.828 20 12.243V19H4v-2.243l3-3z"/>
           </svg>
        </div>
      </div>
    </div>
  );
};