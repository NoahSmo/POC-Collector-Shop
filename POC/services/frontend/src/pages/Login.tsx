import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, formData);
        login(res.data.token, res.data.user.id, res.data.user.role, res.data.user.name);
        navigate('/dashboard');
    } catch (err: any) {
        console.error("Login failed", err);
        setError(err.response?.data?.error || t('invalid_credentials'));
    }
  };

  const handleQuickLogin = (email: string) => {
    setFormData({ email, password: 'password123' });
    // Auto submit after a short delay
    setTimeout(() => {
      const submitBtn = document.getElementById('login-submit-btn');
      submitBtn?.click();
    }, 100);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="product-frame w-full max-w-md p-2">
        <div className="product-frame-inner flex-col !aspect-auto py-12 px-8 shadow-2xl">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-cinzel text-vintage-gold mb-2 tracking-widest">{t('sign_in')}</h2>
            <div className="ornate-divider my-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-vintage-gold mx-2 opacity-50">
                <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
              </svg>
            </div>
            <p className="text-vintage-gold-muted font-lora text-sm">{t('welcome_back')}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-xs text-center font-lora">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-vintage-gold text-xs uppercase tracking-widest font-cinzel font-bold">{t('email_address')}</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('email_placeholder')}
                className="bg-black/80 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner w-full transition-colors focus:bg-black placeholder:text-vintage-gold/80"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vintage-gold text-xs uppercase tracking-widest font-cinzel font-bold">{t('password_label')}</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t('password_placeholder')}
                className="bg-black/80 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner w-full transition-colors focus:bg-black placeholder:text-vintage-gold/80"
              />
            </div>

            <button 
              id="login-submit-btn"
              type="submit" 
              className="vintage-btn w-full py-4 mt-6 !text-black font-cinzel font-bold tracking-[0.2em] bg-vintage-gold shadow-xl hover:bg-white transition-all transform hover:scale-[1.02] uppercase"
            >
              {t('login')}
            </button>

            <div className="mt-8 pt-8 border-t border-vintage-gold/20 flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-widest text-vintage-gold/40 mb-4 font-cinzel">Quick Access (Seeded Accounts)</p>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@collector.shop')}
                  className="flex-1 text-[10px] py-2 border border-vintage-gold/30 text-vintage-gold hover:bg-vintage-gold/10 transition-colors uppercase tracking-[0.2em] font-cinzel"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user@collector.shop')}
                  className="flex-1 text-[10px] py-2 border border-vintage-gold/30 text-vintage-gold hover:bg-vintage-gold/10 transition-colors uppercase tracking-[0.2em] font-cinzel"
                >
                  User
                </button>
              </div>
            </div>

            <p className="text-center text-vintage-gold-muted text-xs font-lora mt-4">
              {t('new_here')} <Link to="/register" className="text-vintage-gold hover:underline">{t('create_account_link')}</Link>
            </p>

          </form>

        </div>
      </div>
    </div>
  );
}
