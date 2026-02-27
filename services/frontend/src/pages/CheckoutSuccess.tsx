import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function CheckoutSuccess() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const sessionId = searchParams.get('session_id');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        await axios.get(`${API_URL}/api/stripe/verify-session?sessionId=${sessionId}`);
      } catch (err) {
        console.error("Verification failed:", err);
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId, API_URL]);

  return (
    <div className="max-w-xl mx-auto py-24 px-6 text-center animate-fade-in-up">
      {verifying ? (
        <div className="py-20">
          <div className="w-16 h-16 border-4 border-vintage-gold border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-2xl font-cinzel text-vintage-gold">{t('loading')}</h2>
        </div>
      ) : (
        <>
          <div className="w-24 h-24 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-5xl font-cinzel text-vintage-gold mb-6">{t('checkout_success')}</h1>
          <p className="font-lora text-vintage-gold-muted text-xl mb-12 italic">{t('checkout_success_desc')}</p>
          
          <Link to="/" className="inline-block py-4 px-10 border border-vintage-gold text-vintage-gold font-cinzel text-lg hover:bg-vintage-gold hover:text-black transition-all hover-scale shadow-xl">
            {t('back_to_home').toUpperCase()}
          </Link>
        </>
      )}
    </div>
  );
}
