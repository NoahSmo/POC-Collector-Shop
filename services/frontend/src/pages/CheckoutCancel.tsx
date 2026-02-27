import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CheckoutCancel() {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl mx-auto py-24 px-6 text-center animate-fade-in-up">
      <div className="w-24 h-24 bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>
      <h1 className="text-5xl font-cinzel text-vintage-gold mb-6">{t('checkout_cancel')}</h1>
      <p className="font-lora text-vintage-gold-muted text-xl mb-12 italic">{t('checkout_cancel_desc')}</p>
      
      <Link to="/" className="inline-block py-4 px-10 border border-vintage-gold/50 text-vintage-gold font-cinzel text-lg hover:border-vintage-gold hover:bg-vintage-gold/10 transition-all hover-scale">
        {t('back_to_home').toUpperCase()}
      </Link>
    </div>
  );
}
