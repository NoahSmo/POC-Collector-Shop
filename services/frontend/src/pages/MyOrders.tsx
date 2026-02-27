import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    image: string;
    seller: {
      name: string;
    };
  };
}

export default function MyOrders() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/api/orders/my-purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching my orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, API_URL]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-20 text-vintage-gold border border-vintage-gold/20 bg-vintage-gold/5 rounded">
        <h2>{t('login_required')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
      <div className="flex justify-between items-end mb-12 border-b border-vintage-gold-muted/20 pb-6">
        <div>
          <h4 className="text-vintage-gold-muted uppercase tracking-[0.3em] font-cinzel text-xs mb-2">{t('your_treasures') || 'YOUR TREASURES'}</h4>
          <h1 className="text-4xl font-cinzel text-vintage-gold">{t('my_orders') || 'MY ORDERS'}</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-vintage-gold font-lora py-20 italic animate-pulse">{t('loading_treasures')}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border border-vintage-gold-muted/20 rounded-lg bg-black/20">
          <p className="text-vintage-gold-muted font-lora text-lg mb-6">{t('no_orders_yet') || 'You have not acquired any treasures yet.'}</p>
          <Link to="/" className="vintage-btn">{t('shop_now')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((order) => (
            <div key={order.id} className="product-frame p-6 flex flex-col gap-4 group">
              <Link to={`/product/${order.product.id}`}>
                <div className="aspect-[4/3] bg-black/40 border border-vintage-gold/10 overflow-hidden rounded relative">
                   <img 
                    src={order.product.image} 
                    alt={order.product.title} 
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform drop-shadow-[0_5px_15px_rgba(0,0,0,1)]"
                   />
                   <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 border border-vintage-gold text-vintage-gold text-[10px] font-cinzel uppercase tracking-widest rounded-sm">
                      {order.status === 'PURCHASED' ? t('acquired') : order.status}
                   </div>
                </div>
              </Link>
              
              <div>
                <Link to={`/product/${order.product.id}`}>
                  <h3 className="text-xl font-cinzel text-vintage-gold mb-1 group-hover:text-white transition-colors">
                    {order.product.title}
                  </h3>
                </Link>
                <div className="flex justify-between items-center text-sm font-lora text-vintage-gold-muted border-t border-vintage-gold-muted/10 pt-3 mt-3">
                  <span className="italic">{t('seller_label', { name: order.product.seller?.name || 'Unknown' })}</span>
                  <span className="font-bold text-vintage-gold">{order.amount / 100}€</span>
                </div>
                <div className="text-[10px] text-vintage-gold-muted/50 mt-2">
                  Acquired on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
