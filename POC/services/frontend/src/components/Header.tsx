import { useAuthStore } from '../context/useAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();

  const languages = ['fr', 'en', 'es', 'it'];

  
  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };

  return (
    <header className="py-6 bg-transparent border-b border-vintage-gold-muted/20 relative z-50">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* Logo - Matching the ornate vintage style */}
        <Link to="/" className="flex flex-col items-center group">
          <span className="text-3xl font-cinzel text-vintage-gold tracking-widest font-bold filter drop-shadow-[0_0_8px_rgba(194,155,98,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(194,155,98,0.6)] transition-all">
            COLLECTOR.SHOP
          </span>
          <span className="text-[0.6rem] font-lora tracking-[0.3em] font-light text-vintage-gold-muted -mt-1 uppercase">
            {t('online_shop')}
          </span>
        </Link>
        
        {/* Center Nav Links */}
        <nav className="hidden md:flex gap-10 items-center">
            <Link to="/" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('catalog')}</Link>
            
            {isAuthenticated && user.role === 'admin' && (
              <div className="flex gap-10">
                <Link to="/admin" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('admin')}</Link>
                <Link to="/admin/management" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('admin_management')}</Link>
              </div>
            )}

            {isAuthenticated && user.role === 'user' && (
              <Link to="/dashboard" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('dashboard')}</Link>
            )}

            {isAuthenticated && (
              <Link to="/my-articles" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('my_products')}</Link>
            )}

            {isAuthenticated && (
              <Link to="/profile" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('profile')}</Link>
            )}
            {isAuthenticated && (
              <Link to="/list-item" className="text-xs uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors hover-scale">{t('create_product')}</Link>
            )}
        </nav>

        {/* Right Nav Icons */}
        <div className="flex gap-4 items-center">
            
            <button 
                onClick={cycleLanguage} 
                className="text-[0.65rem] uppercase font-bold text-vintage-gold-muted hover:text-vintage-gold transition-colors mr-2 w-6 text-center"
                title={t('language')}
            >
                {i18n.language}
            </button>
            
            {!isAuthenticated ? (
                <div className="flex gap-4 items-center ml-2">
                    <Link to="/login" className="text-[0.7rem] uppercase tracking-widest text-vintage-gold-muted hover:text-vintage-gold transition-colors font-bold">
                        {t('login')}
                    </Link>
                    <Link to="/register" className="border border-vintage-gold-muted/50 text-vintage-gold-muted px-4 py-2 text-[0.7rem] uppercase tracking-widest hover:border-vintage-gold hover:text-vintage-gold hover:bg-vintage-gold/5 transition-all ml-1 font-bold">
                        {t('register')}
                    </Link>
                </div>
            ) : (
                <button onClick={logout} className="text-xs border border-vintage-gold-muted text-vintage-gold-muted px-4 py-1 hover:text-vintage-gold hover:border-vintage-gold transition-colors" title={`${t('logout')} ${user.name}`}>
                  {t('logout').toUpperCase()}
                </button>
            )}
        </div>
      </div>
    </header>
  );
}
