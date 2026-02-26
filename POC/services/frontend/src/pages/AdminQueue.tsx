import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

interface PendingProduct {
  id: string;
  title: string;
  year: string;
  price: string;
  image: string;
  seller: { name: string };
  createdAt: string;
}

export default function AdminQueue() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [queue, setQueue] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchPending = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/api/products/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQueue(res.data);
      } catch (err) {
        console.error("Error fetching pending products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [isAuthenticated, user, API_URL]);

  if (!isAuthenticated || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-20 text-accent border border-accent/20 bg-accent/5 rounded">
        <h2>{t('login_required')} - Admin Access Only</h2>
      </div>
    );
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('auth_token');
      const status = action === 'approve' ? 'approved' : 'rejected';
      await axios.patch(`${API_URL}/api/products/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update UI
      setQueue(prev => prev.filter(item => item.id !== id));
      console.log(`Product ${id} was ${action}d`);
    } catch (err) {
      console.error(`Error ${action}ing product:`, err);
      showToast(`Failed to ${action} product`, 'error');
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl mb-8 flex items-center gap-4">
        <span className="w-8 h-8 rounded-full border border-primary flex items-center justify-center text-sm">{queue.length}</span>
        {t('admin')}
      </h1>

      {loading ? (
        <div className="flex justify-center p-12 text-primary animate-pulse">{t('loading_items')}</div>
      ) : queue.length === 0 ? (
        <div className="text-center p-12 border border-white/10 rounded-lg text-white/50">{t('no_items')}</div>
      ) : (
        <div className="space-y-4" data-cy="admin-queue-list">
          {queue.map(item => (
            <div key={item.id} className="bg-white/5 border border-primary/20 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/50 transition-colors">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{item.title} ({item.year})</h3>
                  <span className="text-xs px-2 py-1 rounded bg-black/50 border border-white/10 font-mono text-white/50">{item.id}</span>
                </div>
                <div className="text-sm text-white/70 flex gap-4">
                  <span>Seller: <span className="text-primary">{item.seller?.name || 'Unknown'}</span></span>
                  <span>Price: <span className="text-vintage-gold">{item.price}</span></span>
                </div>
                {item.image && (
                  <div className="mt-3">
                    <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded border border-white/10" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleAction(item.id, 'reject')}
                  className="flex-1 md:flex-none px-6 py-2 border border-accent text-accent hover:bg-accent hover:text-white font-bold tracking-wider text-sm transition-colors focus:ring-2 focus:ring-accent focus:outline-none rounded"
                >
                  {t('reject')}
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'approve')}
                  data-cy={`approve-btn-${item.id}`}
                  className="flex-1 md:flex-none px-6 py-2 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background font-bold tracking-wider text-sm transition-colors focus:ring-2 focus:ring-primary focus:outline-none rounded shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  {t('approve')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
