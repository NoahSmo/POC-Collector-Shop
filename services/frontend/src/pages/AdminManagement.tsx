import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/useAuth';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

interface Product {
  id: string;
  title: string;
  year: string;
  price: string;
  image: string;
  seller: { name: string };
  createdAt: string;
}

export default function AdminManagement() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchApproved = async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_URL}/api/products/approved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching approved products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, [isAuthenticated, user, API_URL]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    
    try {
      setDeletingId(id);
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(t('success_delete'), 'success');
      setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Error deleting product", 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-20 text-accent border border-accent/20 bg-accent/5 rounded">
        <h2>{t('login_required')} - Admin Access Only</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in-up">
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-4xl font-cinzel text-vintage-gold uppercase tracking-widest">
            {t('admin_management')}
        </h1>
        <span className="bg-vintage-gold/10 border border-vintage-gold/30 px-4 py-1 rounded-full text-xs text-vintage-gold font-cinzel">
            {products.length} {t('catalog').toUpperCase()}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-vintage-gold animate-pulse font-lora italic">{t('loading_items')}</div>
      ) : products.length === 0 ? (
        <div className="text-center p-20 border border-dashed border-vintage-gold/20 rounded-lg text-vintage-gold-muted/50 font-lora">
            {t('no_items')}
        </div>
      ) : (
        <div className="bg-black/40 border border-vintage-gold/10 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-vintage-gold/5 border-b border-vintage-gold/20">
                <th className="p-4 text-xs font-cinzel text-vintage-gold uppercase tracking-widest">{t('product_title')}</th>
                <th className="p-4 text-xs font-cinzel text-vintage-gold uppercase tracking-widest">{t('seller')}</th>
                <th className="p-4 text-xs font-cinzel text-vintage-gold uppercase tracking-widest">{t('product_price')}</th>
                <th className="p-4 text-xs font-cinzel text-vintage-gold uppercase tracking-widest text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vintage-gold/10">
              {products.map((product: Product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded border border-vintage-gold/20" />
                    <div>
                      <div className="text-vintage-gold font-cinzel text-sm">{product.title}</div>
                      <div className="text-[10px] text-vintage-gold-muted uppercase tracking-tighter">{t('circa')}{product.year}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-vintage-gold-muted font-lora">{product.seller?.name || 'Unknown'}</td>
                  <td className="p-4 text-sm text-vintage-gold font-cinzel">{product.price}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <Link to={`/product/${product.id}`} className="p-2 text-vintage-gold-muted hover:text-vintage-gold transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="p-2 text-red-500/50 hover:text-red-500 transition-colors disabled:opacity-30"
                      >
                        {deletingId === product.id ? '...' : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
