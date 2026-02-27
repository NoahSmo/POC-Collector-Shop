import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';

interface OrderItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  buyer: {
    name: string;
  };
  product: {
    id: string;
    title: string;
    image: string;
  };
}

export default function EarningsDashboard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/api/orders/earnings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTotalEarnings(response.data.totalEarnings);
        setOrders(response.data.orders);
      } catch (err: any) {
        console.error("Error fetching earnings:", err);
        showToast("Error loading earnings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [API_URL, showToast]);

  if (loading) {
    return <div className="text-center text-vintage-gold py-20 font-cinzel text-2xl">{t('loading_treasures')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-cinzel text-vintage-gold mb-8 text-center">{t('earnings_dashboard')}</h1>
      
      <div className="bg-black/40 border border-vintage-gold-muted/30 rounded-xl p-8 mb-12 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-vintage-gold/10 to-transparent pointer-events-none"></div>
        <h2 className="text-xl font-lora text-vintage-gold-muted mb-2">{t('total_earnings')}</h2>
        <p className="text-6xl font-cinzel text-vintage-gold">€{(totalEarnings / 100).toFixed(2)}</p>
      </div>

      <h3 className="text-2xl font-cinzel text-vintage-gold mb-6 border-b border-vintage-gold-muted/20 pb-4">{t('sold_items')}</h3>
      
      {orders.length === 0 ? (
        <p className="text-center text-vintage-gold-muted font-lora italic py-10">No items sold yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="flex flex-col sm:flex-row items-center gap-6 bg-black/30 border border-vintage-gold-muted/20 p-4 rounded-lg hover:bg-black/50 transition-colors">
              <img src={order.product.image} alt={order.product.title} className="w-24 h-24 object-cover rounded shadow-md filter sepia-[0.3]" />
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-xl font-cinzel text-vintage-gold mb-1">{order.product.title}</h4>
                <p className="text-sm font-lora text-vintage-gold-muted">Sale Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-sm font-lora text-vintage-gold-muted">{t('buyer_label', { name: order.buyer.name })}</p>
              </div>
              <div className="text-2xl font-cinzel text-vintage-gold whitespace-nowrap">
                €{(order.amount / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
