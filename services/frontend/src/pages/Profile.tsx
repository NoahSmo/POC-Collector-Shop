import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';
import axios from 'axios';

interface UserProfile {
  name: string;
  email: string;
  bio: string | null;
  location: string | null;
}

export default function Profile() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, API_URL]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_URL}/api/users/profile`, 
        { 
          name: profile.name,
          bio: profile.bio,
          location: profile.location
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-vintage-gold py-20 font-cinzel text-2xl">{t('loading')}</div>;
  }

  if (!profile) {
    return <div className="text-center text-vintage-gold py-20 font-cinzel text-2xl">{t('item_not_found')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-cinzel text-vintage-gold mb-2 tracking-widest">{t('profile').toUpperCase()}</h1>
        <div className="w-16 h-0.5 bg-vintage-gold mx-auto opacity-50"></div>
      </header>

      <div className="border border-vintage-gold/20 rounded-lg bg-black/40 p-8 shadow-inner">
        <form onSubmit={handleSave} className="space-y-6 font-lora">
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-vintage-gold-muted text-sm mb-2 uppercase tracking-wider">{t('name')}</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-transparent border-b border-vintage-gold/30 py-2 text-white focus:outline-none focus:border-vintage-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-vintage-gold-muted text-sm mb-2 uppercase tracking-wider">{t('email')}</label>
              <input 
                type="text" 
                value={profile.email}
                disabled
                className="w-full bg-transparent border-b border-vintage-gold/10 py-2 text-vintage-gold-muted/50 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-vintage-gold-muted text-sm mb-2 uppercase tracking-wider">{t('location')}</label>
              <input 
                type="text" 
                value={profile.location || ''}
                placeholder={t('location_placeholder')}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="w-full bg-transparent border-b border-vintage-gold/30 py-2 text-white focus:outline-none focus:border-vintage-gold transition-colors placeholder-vintage-gold-muted/30"
              />
            </div>

            <div>
              <label className="block text-vintage-gold-muted text-sm mb-2 uppercase tracking-wider">{t('bio')}</label>
              <textarea 
                rows={4}
                value={profile.bio || ''}
                placeholder={t('bio_placeholder')}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-transparent border border-vintage-gold/30 rounded p-3 text-white focus:outline-none focus:border-vintage-gold transition-colors placeholder-vintage-gold-muted/30 resize-none"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col items-center gap-4">
            <button 
              type="submit" 
              disabled={saving}
              className="px-12 py-3 bg-vintage-gold text-black font-cinzel font-bold tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              {saving ? t('saving').toUpperCase() : t('save_changes').toUpperCase()}
            </button>
            
            {success && (
              <p className="text-green-500 font-lora italic text-sm animate-fade-in">{t('success_profile_update')}</p>
            )}
          </div>

        </form>
      </div>

      <div className="mt-8 text-center">
        <a 
          href="/cgu" 
          className="text-vintage-gold-muted/60 hover:text-vintage-gold text-sm font-lora underline underline-offset-4 transition-colors"
        >
          {t('terms_of_service')}
        </a>
      </div>
    </div>
  );
}
