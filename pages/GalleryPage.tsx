
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';

export const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const googleMapsUrl = "https://www.google.com/search?client=safari&hs=osHU&sa=X&sca_esv=c10fa1f35bad6765&hl=en-sa&channel=30&biw=440&bih=796&sxsrf=AE3TifP0B2N50yYo-9dsJwge91_cgsfsXQ:1765407043362&kgmid=/g/11yd92l6yn&q=%D9%83%D9%88%D9%81%D9%8A+%D8%B9%D9%82%D9%8A%D9%82&shndl=30&shem=damc,ptotple,shrtsdl&source=sh/x/loc/act/m1/3&kgs=c17131cfb27e36c1&utm_source=damc,ptotple,shrtsdl,sh/x/loc/act/m1/3#lpg=cid:CgIgAQ%3D%3D";

  // Configuration for the images provided
  // Assumes user saves images as 1.jpg to 74.jpg in an 'images' folder in public root
  const images = Array.from({ length: 74 }, (_, i) => ({
    id: i + 1,
    src: `images/${i + 1}.jpg`,
    alt: `Aqiq Café Photo ${i + 1}`,
    // Mosaic layout logic: vary spans for visual interest
    isWide: (i + 1) % 5 === 0 || (i + 1) % 11 === 0,
    isTall: (i + 1) % 3 === 0 && !((i + 1) % 5 === 0)
  }));

  const GalleryImage = ({ src, alt }: { src: string, alt: string }) => {
    const [error, setError] = useState(false);

    if (error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-2 text-center border border-dashed border-gray-200 rounded-lg">
          <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span className="text-[10px] font-mono text-gray-500 break-all">Missing: {src}</span>
        </div>
      );
    }

    return (
        <img 
          src={src} 
          alt={alt} 
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl font-bold text-aqiq-primary mb-2 rtl:font-arabic">
          {t('gallery_title')}
        </h1>
        <p className="text-aqiq-accent italic mb-6">{t('gallery_subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
        {images.map((img) => (
          <div 
            key={img.id} 
            className={`
              relative overflow-hidden rounded-xl shadow-sm group bg-gray-100
              ${img.isWide ? 'md:col-span-2' : ''}
              ${img.isTall ? 'row-span-2' : ''}
            `}
          >
            <GalleryImage src={img.src} alt={img.alt} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="gap-2 inline-flex items-center shadow-lg hover:shadow-xl">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>
            {t('btn_google_photos')}
          </Button>
        </a>
      </div>
    </div>
  );
};
