import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';
import { useToast } from '../context/ToastContext';

interface Product {
  id: string;
  title: string;
  year: string;
  price: string;
  image: string;
  description: string;
  sellerId: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, API_URL]);

  const handleChatWithSeller = async () => {
    if (product?.sellerId === user?.id) {
      showToast(t('cannot_chat_self') || "You cannot start a chat with yourself.", 'error');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/api/chats/rooms`, 
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Error starting chat:", err);
      const msg = err.response?.data?.error || "Error starting chat. Please try logging out and back in.";
      showToast(msg, 'error');
    }
  };

  if (loading) {
    return <div className="text-center text-vintage-gold py-20 font-cinzel text-2xl">{t('loading_treasures')}</div>;
  }

  if (!product) {
    return <div className="text-center text-vintage-gold py-20 font-cinzel text-2xl">{t('item_not_found')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      
      <Link to="/" className="inline-flex items-center text-vintage-gold-muted hover:text-vintage-gold mb-12 transition-colors font-lora hover-scale">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        {t('back_to_catalog')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Product Image */}
        <div className="product-frame p-8 rounded-xl relative group bg-black/20 animate-fade-in">
          <div className="absolute inset-0 bg-vintage-gold/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-auto rounded-lg shadow-2xl relative z-10 filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col animate-fade-in-up">
          <header className="mb-8 pb-8 border-b border-vintage-gold-muted/20">
            <span className="text-vintage-gold font-lora italic text-lg tracking-wide mb-2 block">
                {t('circa')}{product.year}
            </span>
            <h1 className="text-5xl font-cinzel text-vintage-gold leading-tight mb-6">
                {product.title}
            </h1>
            
            <p className="text-vintage-gold-muted/90 font-lora text-lg leading-relaxed mb-8">
                {product.description}
            </p>

            <div className="flex items-end gap-6 mb-12 pb-12 border-b border-vintage-gold-muted/20">
                <span className="text-4xl font-cinzel text-vintage-gold">{product.price}</span>
                <span className="text-vintage-gold-muted/50 font-lora italic mb-1">{t('authenticity_guaranteed')}</span>
            </div>

            <div className="space-y-4">
                {isAuthenticated ? (
                    <button 
                        onClick={handleChatWithSeller}
                        className="w-full py-4 bg-vintage-gold text-black font-cinzel font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-3 group shadow-xl hover-scale"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        {t('chat_with_seller').toUpperCase()}
                    </button>
                ) : (
                    <div className="p-6 border border-vintage-gold-muted/30 rounded bg-vintage-gold/5 text-center">
                        <p className="text-vintage-gold font-lora italic mb-4">{t('login_to_purchase')}</p>
                        <Link to="/register" className="text-vintage-gold font-cinzel border-b border-vintage-gold hover:text-white hover:border-white transition-all">
                            {t('create_account').toUpperCase()}
                        </Link>
                    </div>
                )}
            </div>
          </header>
        </div>
      </div>
    </div>
  );
}
