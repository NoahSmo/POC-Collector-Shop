import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) return;
    
    try {
        const res = await axios.post(`${API_URL}/api/auth/register`, formData);
        login(res.data.token, res.data.user.id, res.data.user.role, res.data.user.name);
        navigate('/');
    } catch (err) {
        console.error("Registration failed", err);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="product-frame w-full max-w-md p-2">
        <div className="product-frame-inner flex-col !aspect-auto py-12 px-8 shadow-2xl">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-cinzel text-vintage-contrast mb-2 tracking-widest">{t('create_account')}</h2>
            <div className="ornate-divider my-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-vintage-contrast mx-2 opacity-50">
                <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
              </svg>
            </div>
            <p className="text-vintage-contrast/80 font-lora text-sm">{t('exclusive_club')}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-vintage-contrast text-xs uppercase tracking-widest font-cinzel font-bold">{t('full_name')}</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('name_placeholder')}
                className="bg-black/10 border border-vintage-gold/50 text-vintage-contrast font-lora outline-none px-4 py-3 shadow-inner w-full transition-colors focus:bg-white/10 placeholder:text-vintage-contrast/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vintage-contrast text-xs uppercase tracking-widest font-cinzel font-bold">{t('email_address')} *</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('email_placeholder')}
                className="bg-black/10 border border-vintage-gold/50 text-vintage-contrast font-lora outline-none px-4 py-3 shadow-inner w-full transition-colors focus:bg-white/10 placeholder:text-vintage-contrast/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vintage-contrast text-xs uppercase tracking-widest font-cinzel font-bold">{t('password_label')} *</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t('password_placeholder')}
                className="bg-black/10 border border-vintage-gold/50 text-vintage-contrast font-lora outline-none px-4 py-3 shadow-inner w-full transition-colors focus:bg-white/10 placeholder:text-vintage-contrast/50"
              />
            </div>

            <button type="submit" className="vintage-btn w-full py-4 mt-6 text-black font-cinzel font-bold tracking-[0.2em] bg-vintage-gold shadow-xl hover:bg-white transition-all transform hover:scale-[1.02] uppercase">
              {t('create_account')}
            </button>

            <p className="text-center text-vintage-contrast/70 text-xs font-lora mt-4">
              {t('already_have_account')} <Link to="/login" className="text-vintage-contrast font-bold hover:underline">{t('login_here')}</Link>
            </p>

          </form>

        </div>
      </div>
    </div>
  );
}
