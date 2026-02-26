
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Product {
  id: string;
  title: string;
  year: string;
  price: string;
  image: string;
  description: string;
}

export default function Landing() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products`, { headers });
        setTopProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-20 min-h-screen pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-24 flex flex-col lg:flex-row items-center justify-between z-10">
        
        {/* Timeline (Left absolute) */}
        <div className="hidden lg:flex flex-col items-center absolute left-0 top-0 bottom-0 text-vintage-gold-muted text-xs font-lora">
          <div className="w-px h-16 bg-vintage-gold-muted/30"></div>
          <div className="flex items-center gap-2 my-8">
            <span className="w-1.5 h-1.5 rounded-full bg-vintage-gold/50 shadow-[0_0_8px_rgba(194,155,98,0.8)]"></span>
            <span className="absolute left-6">1913</span>
          </div>
          <div className="w-px h-32 bg-vintage-gold-muted/30"></div>
          <div className="flex items-center gap-2 my-8 relative">
            <span className="w-2 h-2 rounded-full bg-vintage-gold shadow-[0_0_10px_rgba(194,155,98,1)]"></span>
            <span className="absolute left-6 text-vintage-gold font-bold">1920</span>
          </div>
          <div className="w-px h-40 bg-vintage-gold-muted/30"></div>
          <div className="flex items-center gap-2 my-8">
            <span className="w-1.5 h-1.5 rounded-full bg-vintage-gold/50"></span>
            <span className="absolute left-6">1983</span>
          </div>
          <div className="w-px h-12 bg-vintage-gold-muted/30"></div>
          <div className="mt-4 flex flex-col gap-2">
            <button className="w-6 h-6 rounded-full border border-vintage-gold-muted flex items-center justify-center hover:bg-vintage-gold hover:text-black transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg></button>
            <button className="w-6 h-6 rounded-full border border-vintage-gold-muted flex items-center justify-center hover:bg-vintage-gold hover:text-black transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
          </div>
        </div>

        {/* Hero Text */}
        <div className="lg:w-1/2 lg:pl-24 z-20">
          <h3 className="text-vintage-gold uppercase tracking-[0.2em] font-cinzel text-sm mb-4">
            {t('new_arrivals')}
          </h3>
          <h1 className="text-5xl md:text-7xl font-cinzel text-vintage-gold mb-6 drop-shadow-[0_2px_15px_rgba(194,155,98,0.2)] animate-fade-in-up">
            Typewriter<br/>Underwood
          </h1>
          <p className="font-lora text-vintage-gold-muted/80 text-lg md:text-xl leading-relaxed max-w-lg mb-12 animate-fade-in-up delay-100">
            {t('hero_subtitle')}
          </p>
          <Link to="/product/1" className="vintage-btn text-lg inline-block animate-fade-in-up delay-200">
            <span className="relative z-10">{t('shop_now')}</span>
          </Link>
        </div>

        {/* Hero Image / Badge */}
        <div className="lg:w-1/2 relative mt-16 lg:mt-0 flex justify-end">
           {/* The giant gold circle backdrop */}
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#c29b62] rounded-full mix-blend-soft-light opacity-90 blur-[1px]"></div>
           
           <img 
            src="/typewriter_hero.png" 
            alt="Vintage Typewriter" 
            className="relative z-10 w-[120%] max-w-[700px] object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.9)] right-[-5%] transform hover:scale-105 transition-transform duration-700 ease-out animate-fade-in"
           />
        </div>

      </section>

      {/* 2. ORNATE DIVIDER */}
      <div className="ornate-divider max-w-5xl mx-auto items-center flex justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-vintage-gold/30"></div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-vintage-gold mx-4 opacity-70">
          <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
        </svg>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-vintage-gold/30"></div>
      </div>

      {/* 3. LATEST TREASURES CAROUSEL */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h4 className="text-vintage-gold-muted uppercase tracking-[0.3em] font-cinzel text-xs mb-2">{t('new_arrivals')}</h4>
              <h2 className="text-4xl font-cinzel text-vintage-gold">{t('latest_treasures') || 'LATEST ARTICLES'}</h2>
            </div>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-vintage-gold/30 flex items-center justify-center text-vintage-gold hover:bg-vintage-gold hover:text-black transition-all group">
                <svg className="w-5 h-5 group-active:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button className="w-12 h-12 rounded-full border border-vintage-gold/30 flex items-center justify-center text-vintage-gold hover:bg-vintage-gold hover:text-black transition-all group">
                <svg className="w-5 h-5 group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x no-scrollbar">
            {loading ? (
              <div className="w-full text-center text-vintage-gold font-lora py-20 italic animate-pulse">{t('unveiling_treasures') || 'Unveiling articles...'}</div>
            ) : topProducts.slice(0, 5).map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="min-w-[300px] md:min-w-[400px] group snap-start"
              >
                <div className="relative aspect-[4/5] bg-black/40 border border-vintage-gold/10 overflow-hidden group-hover:border-vintage-gold/40 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain p-8 transform group-hover:scale-110 transition-transform duration-1000 ease-out z-0 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <span className="text-[10px] text-vintage-gold font-cinzel tracking-widest block mb-2">{product.year}</span>
                    <h3 className="text-2xl font-cinzel text-white mb-1 group-hover:text-vintage-gold transition-colors">{product.title}</h3>
                    <p className="text-vintage-gold text-lg font-lora font-bold">{product.price}</p>
                  </div>
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="w-8 h-8 rounded-full bg-vintage-gold flex items-center justify-center text-black">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TECH DIVIDER */}
      <div className="relative flex justify-center items-center h-16 w-full max-w-5xl mx-auto my-12">
        <div className="absolute w-full h-px bg-vintage-gold-muted/20"></div>
        <div className="absolute w-[40px] h-px bg-transparent border-t border-r border-vintage-gold-muted/50 transform rotate-45 left-1/4"></div>
        <div className="absolute w-[40px] h-px bg-transparent border-t border-l border-vintage-gold-muted/50 transform -rotate-45 right-1/4"></div>
      </div>

      {/* 5. TOP PRODUCTS GRID */}
      <section className="z-10 relative mt-24 px-6">
        <h2 className="text-3xl font-cinzel text-vintage-gold mb-12 text-center">{t('top_products')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-3 text-center text-vintage-gold font-lora py-10">{t('loading_treasures')}</div>
          ) : topProducts.map((product) => (
            <div key={product.id} className="product-frame group cursor-pointer relative animate-scale-in">
              <div className="product-frame-inner bg-black/50 border border-vintage-gold/20 overflow-hidden aspect-square flex items-center justify-center p-8 group-hover:border-vintage-gold/60 transition-all duration-500 shadow-2xl">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="text-center mt-6">
                <h3 className="text-xl font-cinzel text-vintage-gold mb-1 group-hover:text-white transition-colors">{product.title}</h3>
                <p className="font-lora text-vintage-gold-muted text-sm mb-3 italic">{t('years_made', { year: product.year })}</p>
                <div className="flex justify-center gap-4">
                  <Link to={`/product/${product.id}`} className="text-[10px] uppercase tracking-widest font-cinzel text-vintage-gold hover:text-white border-b border-vintage-gold/30 pb-0.5 transition-colors">{t('show_more')}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <button onClick={() => showToast("Load More Products (Mock)", 'info')} className="vintage-btn">{t('show_more')}</button>
        </div>
      </section>

    </div>
  );
}
