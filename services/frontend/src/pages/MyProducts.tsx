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
  description: string;
  status: string;
}

export default function MyProducts() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/products/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching my products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProducts();
    }
  }, [isAuthenticated, API_URL]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    
    try {
      setDeletingId(id);
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(t('success_delete'), 'success');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Error deleting product", 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-20 text-vintage-gold border border-vintage-gold/20 bg-vintage-gold/5 rounded">
        <h2>{t('login_required')}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-12 min-h-screen pb-20 animate-fade-in-up">
      <div className="border-b border-vintage-gold/10 pb-8">
        <h1 className="text-4xl font-cinzel text-vintage-gold uppercase tracking-widest">{t('my_products')}</h1>
        <p className="font-lora text-vintage-gold-muted mt-2 italic">{t('manage_your_treasures') || 'Manage your listed treasures'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full text-center py-20 text-vintage-gold font-lora animate-pulse italic">
            {t('loading_treasures')}
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-vintage-gold/20 rounded-lg">
            <p className="text-vintage-gold-muted font-lora mb-6">{t('no_items_listed') || "You haven't listed any items yet."}</p>
            <Link to="/list-item" className="vintage-btn inline-block">
              {t('create_product')}
            </Link>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-black/40 border border-vintage-gold/10 rounded-lg overflow-hidden group hover:border-vintage-gold/30 transition-all flex flex-col">
              <div className="aspect-square relative bg-white/5 flex items-center justify-center p-6">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${
                    product.status === 'approved' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                    product.status === 'pending' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                    'border-red-500/50 text-red-400 bg-red-500/10'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-cinzel text-vintage-gold">{product.title}</h3>
                  <span className="text-vintage-gold font-bold font-lora">
                    {product.price.includes('€') ? product.price : `€${product.price}`}
                  </span>
                </div>
                <p className="text-xs text-vintage-gold-muted font-lora mb-4 uppercase tracking-tighter">{t('circa')}{product.year}</p>
                <p className="text-sm text-vintage-gold-muted/80 font-lora line-clamp-2 mb-6 flex-1 italic">
                  "{product.description}"
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    to={`/product/${product.id}`} 
                    className="flex-1 min-w-[80px] text-center py-2 border border-vintage-gold/20 text-[10px] uppercase font-cinzel text-vintage-gold hover:bg-vintage-gold hover:text-black transition-all"
                  >
                    {t('show_more')}
                  </Link>
                  <Link 
                    to={`/edit-item/${product.id}`} 
                    className="flex-1 min-w-[80px] text-center py-2 border border-blue-500/20 text-[10px] uppercase font-cinzel text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                  >
                    {t('modify') || 'Modify'}
                  </Link>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="flex-1 min-w-[80px] px-4 py-2 border border-red-500/30 text-[10px] uppercase font-cinzel text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {deletingId === product.id ? '...' : t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
