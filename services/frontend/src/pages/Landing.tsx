
import { useState, useEffect, useRef } from 'react';
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
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 400; // Matches min-w of items
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

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

  const nextHero = () => {
    if (topProducts.length <= 1) return;
    setCurrentHeroIndex((prev) => (prev + 1) % Math.min(topProducts.length, 5));
  };

  const prevHero = () => {
    if (topProducts.length <= 1) return;
    setCurrentHeroIndex((prev) => (prev - 1 + Math.min(topProducts.length, 5)) % Math.min(topProducts.length, 5));
  };

  useEffect(() => {
    if (topProducts.length <= 1) return;
    
    const interval = setInterval(nextHero, 5000);

    return () => clearInterval(interval);
  }, [topProducts, currentHeroIndex]); // Reset interval when index changes manually

  const heroProduct = topProducts.length > 0 ? topProducts[currentHeroIndex] : null;
  const heroProducts = topProducts.slice(0, 5);

  // Timeline scrolling logic
  const timelineProgress = heroProducts.length > 1 
    ? (currentHeroIndex / (heroProducts.length - 1)) * 100 
    : 0;


  return (
    <div className="space-y-20 min-h-screen pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-24 flex flex-col lg:flex-row items-center justify-between z-10">
        
        {/* Timeline (Left absolute) */}
        <div className="hidden lg:flex flex-col items-center absolute left-0 top-0 bottom-0 text-vintage-gold-muted text-xs font-lora py-12 z-40">
          <div className="relative w-px h-[400px] bg-vintage-gold-muted/20 my-4">
            {/* The Track */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vintage-gold/10 to-transparent"></div>
            
            {/* Markers for each product */}
            {heroProducts.map((p, idx) => (
              <div 
                key={`marker-${p.id}`}
                className="absolute left-1/2 -translate-x-1/2 flex items-center"
                style={{ top: `${(idx / (heroProducts.length - 1)) * 100}%` }}
              >
                <div className={`w-1 h-1 rounded-full transition-colors duration-500 ${idx === currentHeroIndex ? 'bg-vintage-gold' : 'bg-vintage-gold/20'}`}></div>
                <span className={`absolute left-4 text-[10px] transition-all duration-500 ${idx === currentHeroIndex ? 'text-vintage-gold opacity-100 scale-110' : 'text-vintage-gold-muted/40 opacity-40'}`}>
                  {p.year}
                </span>
              </div>
            ))}

            {/* The Moving Indicator Dot */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) z-10"
              style={{ top: `${timelineProgress}%` }}
            >
              <div 
                key={`timeline-dot-${currentHeroIndex}`}
                className="w-3 h-3 rounded-full bg-vintage-gold shadow-[0_0_15px_rgba(194,155,98,1)] animate-pulse"
              ></div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4">
            <button 
              onClick={prevHero}
              className="w-10 h-10 rounded-full border border-vintage-gold-muted/30 flex items-center justify-center hover:bg-vintage-gold hover:text-black transition-all hover:-translate-y-1 active:scale-95 group shadow-lg bg-black/20"
              title="Previous"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button 
              onClick={nextHero}
              className="w-10 h-10 rounded-full border border-vintage-gold-muted/30 flex items-center justify-center hover:bg-vintage-gold hover:text-black transition-all hover:translate-y-1 active:scale-95 group shadow-lg bg-black/20"
              title="Next"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </div>

        {/* Hero Text */}
        <div key={`hero-text-${currentHeroIndex}`} className="lg:w-1/2 lg:pl-24 z-20 animate-fade-in-up">
          <h3 className="text-vintage-gold uppercase tracking-[0.2em] font-cinzel text-sm mb-4">
            {t('new_arrivals')}
          </h3>
          <h1 className="text-5xl md:text-7xl font-cinzel text-vintage-gold mb-6 drop-shadow-[0_2px_15px_rgba(194,155,98,0.2)]">
            {heroProduct ? heroProduct.title : "Typewriter Underwood"}
          </h1>
          <p className="font-lora text-vintage-gold-muted/80 text-lg md:text-xl leading-relaxed max-w-lg mb-12">
            {heroProduct ? heroProduct.description : t('hero_subtitle')}
          </p>
          <Link to={heroProduct ? `/product/${heroProduct.id}` : "/product/1"} className="vintage-btn text-lg inline-block">
            <span className="relative z-10">{t('shop_now')}</span>
          </Link>
        </div>

        {/* Hero Image / Badge */}
        <div key={`hero-img-${currentHeroIndex}`} className="lg:w-1/2 relative mt-16 lg:mt-0 flex justify-end animate-fade-in h-[300px] md:h-[500px]">
           {/* The giant gold circle backdrop */}
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#c29b62] rounded-full mix-blend-soft-light opacity-60 blur-[2px]"></div>
           
           <div className="relative z-10 w-full h-full flex items-center justify-end pr-4">
             <img 
              src={heroProduct ? heroProduct.image : "/typewriter_hero.png"} 
              alt={heroProduct ? heroProduct.title : "Vintage Item"} 
              className="w-auto h-full max-w-full object-contain float-shadow"
             />
           </div>
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
              <button 
                onClick={() => scrollCarousel('left')}
                className="w-12 h-12 rounded-full border border-vintage-gold/30 flex items-center justify-center text-vintage-gold hover:bg-vintage-gold hover:text-black transition-all group"
              >
                <svg className="w-5 h-5 group-active:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                className="w-12 h-12 rounded-full border border-vintage-gold/30 flex items-center justify-center text-vintage-gold hover:bg-vintage-gold hover:text-black transition-all group"
              >
                <svg className="w-5 h-5 group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div 
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x no-scrollbar scroll-smooth"
          >
            {loading ? (
              <div className="w-full text-center text-vintage-gold font-lora py-20 italic animate-pulse">{t('unveiling_treasures') || 'Unveiling articles...'}</div>
            ) : topProducts.slice(0, 5).map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="min-w-[300px] md:min-w-[400px] group snap-start"
              >
                <div className="premium-img-wrapper relative aspect-[4/5] border border-vintage-gold/10 group-hover:border-vintage-gold/40 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain p-12 float-shadow z-0"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <span className="text-[10px] text-vintage-gold font-cinzel tracking-widest block mb-2">{product.year}</span>
                    <h3 className="text-2xl font-cinzel text-white mb-1 group-hover:text-vintage-gold transition-colors">{product.title}</h3>
                    <p className="text-vintage-gold text-lg font-lora font-bold">
                      {product.price.includes('€') ? product.price : `€${product.price}`}
                    </p>
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
              <div className="premium-img-wrapper product-frame-inner bg-black/30 border border-vintage-gold/20 aspect-square flex items-center justify-center p-8 group-hover:border-vintage-gold/60 transition-all duration-500 shadow-2xl">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="max-h-full max-w-full object-contain float-shadow"
                />
              </div>
              <div className="text-center mt-6">
                <h3 className="text-xl font-cinzel text-vintage-gold mb-1 group-hover:text-white transition-colors">{product.title}</h3>
                <p className="font-lora text-vintage-gold-muted text-sm mb-1 italic">{t('years_made', { year: product.year })}</p>
                <p className="text-vintage-gold font-bold font-lora mb-3">
                  {product.price.includes('€') ? product.price : `€${product.price}`}
                </p>
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
