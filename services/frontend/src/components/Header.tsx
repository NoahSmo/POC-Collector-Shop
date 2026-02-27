import { useState } from 'react';
import { useAuthStore } from '../context/useAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const languages = ['fr', 'en', 'es', 'it'];

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300">
      {/* Upper Glass Bar */}
      <div className="backdrop-blur-md bg-black/60 border-b border-vintage-gold/10 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Section - Far Left */}
          <Link to="/" className="flex flex-col items-start group shrink-0">
            <span className="text-2xl font-cinzel text-white tracking-[0.2em] font-bold group-hover:text-vintage-gold transition-colors duration-500">
              COLLECTOR<span className="text-vintage-gold group-hover:text-white transition-colors">.</span>SHOP
            </span>
            <span className="text-[10px] font-lora tracking-[0.4em] text-vintage-gold/50 group-hover:text-vintage-gold/80 transition-all uppercase -mt-1">
              {t('online_shop')}
            </span>
          </Link>

          {/* Navigation Links - Center-Left */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 ml-12">
            <Link to="/" className="nav-link-premium">
              {t('catalog')}
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="nav-link-premium">
                {t('dashboard')}
              </Link>
            )}
          </nav>

          {/* Actions - Right Side */}
          <div className="flex items-center gap-4 lg:gap-6">
            
            {/* Create Item Button */}
            {isAuthenticated && (
              <Link to="/list-item" className="group relative px-5 lg:px-6 py-2 border border-vintage-gold/50 bg-vintage-gold/5 hover:bg-vintage-gold transition-all duration-500 hidden sm:block">
                <span className="relative z-10 text-[10px] font-cinzel font-bold tracking-[0.2em] text-vintage-gold group-hover:text-black transition-colors uppercase">
                  {t('create_product')}
                </span>
              </Link>
            )}

            {/* Message Icon */}
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className="w-10 h-10 rounded-full border border-vintage-gold/20 flex items-center justify-center text-vintage-gold hover:bg-vintage-gold/10 transition-all group"
                title={t('messages')}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </Link>
            )}

            {/* Language Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                onBlur={() => setTimeout(() => setLangDropdownOpen(false), 200)}
                className="w-10 h-10 rounded-full border border-vintage-gold/20 flex items-center justify-center text-[10px] font-cinzel text-vintage-gold hover:bg-vintage-gold/10 transition-all uppercase"
              >
                {i18n.language}
              </button>
              
              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-4 w-24 bg-black/95 backdrop-blur-xl border border-vintage-gold/20 shadow-2xl py-2 z-50 animate-fade-in">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        i18n.changeLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-center py-2 text-[10px] uppercase tracking-widest font-cinzel transition-colors ${i18n.language === lang ? 'text-vintage-gold bg-vintage-gold/10' : 'text-vintage-gold/40 hover:text-vintage-gold'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Auth Section - Far Right */}
            <div className="flex items-center">
              {!isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-[10px] uppercase tracking-[0.2em] font-cinzel text-vintage-gold hover:text-white transition-colors">
                    {t('login')}
                  </Link>
                  <Link to="/register" className="bg-vintage-gold text-black text-[10px] px-6 py-2.5 uppercase tracking-[0.2em] font-cinzel font-bold hover:bg-white transition-all shadow-lg hover:shadow-vintage-gold/20">
                    {t('register')}
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    onBlur={() => setTimeout(() => setAccountDropdownOpen(false), 200)}
                    className="flex items-center gap-3 p-1.5 border border-vintage-gold/20 hover:border-vintage-gold/50 transition-all rounded-full bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-vintage-gold/20 flex items-center justify-center border border-vintage-gold/30">
                      <span className="text-[10px] font-cinzel text-vintage-gold font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-[10px] font-cinzel tracking-widest text-vintage-gold/80 pr-2">
                      {user?.name?.split(' ')[0]?.toUpperCase() || 'ACCOUNT'}
                    </span>
                    <svg className={`hidden sm:block w-3 h-3 text-vintage-gold transition-transform duration-300 mr-1 ${accountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute top-full right-0 mt-4 w-56 bg-black/95 backdrop-blur-xl border border-vintage-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-50 animate-fade-in overflow-hidden rounded-sm">
                      <div className="px-6 py-4 bg-vintage-gold/5 border-b border-vintage-gold/10">
                        <p className="text-[8px] uppercase tracking-widest text-vintage-gold/50 mb-1">{t('welcome_back')}</p>
                        <p className="text-[10px] uppercase tracking-widest text-white font-bold truncate">{user?.name}</p>
                      </div>
                      
                      <Link to="/dashboard" className="block px-6 py-3 text-[10px] uppercase tracking-widest text-vintage-gold/70 hover:text-vintage-gold hover:bg-vintage-gold/5 transition-all">
                        {t('dashboard')}
                      </Link>
                      <Link to="/my-orders" className="block px-6 py-3 text-[10px] uppercase tracking-widest text-vintage-gold/70 hover:text-vintage-gold hover:bg-vintage-gold/5 transition-all">
                        {t('my_orders')}
                      </Link>
                      <Link to="/my-articles" className="block px-6 py-3 text-[10px] uppercase tracking-widest text-vintage-gold/70 hover:text-vintage-gold hover:bg-vintage-gold/5 transition-all">
                        {t('my_articles')}
                      </Link>
                      <Link to="/profile" className="block px-6 py-3 text-[10px] uppercase tracking-widest text-vintage-gold/70 hover:text-vintage-gold hover:bg-vintage-gold/5 transition-all">
                        {t('profile')}
                      </Link>

                      {user?.role === 'admin' && (
                        <>
                          <div className="h-px bg-vintage-gold/10 my-2 mx-4"></div>
                          <Link to="/admin" className="block px-6 py-3 text-[10px] uppercase tracking-widest text-orange-400/80 hover:text-orange-400 hover:bg-orange-400/5 transition-all">
                            {t('admin')}
                          </Link>
                          <Link to="/admin/management" className="block px-6 py-3 text-[10px] uppercase tracking-widest text-orange-400/80 hover:text-orange-400 hover:bg-orange-400/5 transition-all">
                            {t('admin_management')}
                          </Link>
                        </>
                      )}

                      <div className="h-px bg-vintage-gold/10 my-2 mx-4"></div>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
