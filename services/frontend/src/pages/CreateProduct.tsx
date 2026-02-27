import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function CreateProduct() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    year: '',
    price: '',
    category: 'wat', // Default to Watches
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/products/${id}`);
          setFormData(res.data);
        } catch (err) {
          console.error("Error fetching product:", err);
          showToast("Error fetching product data", 'error');
        }
      };
      fetchProduct();
    }
  }, [isEditMode, id, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const inputYear = parseInt(formData.year);

    if (isNaN(inputYear) || inputYear < 1800 || inputYear > 2026) {
      setError(`${t('invalid_year') || 'Invalid year'}. ${t('future_year_error') || 'Year must be between 1800 and 2026'}.`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (isEditMode) {
        await axios.put(`${API_URL}/api/products/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast(t('success_product_update') || "Product successfully updated! It will be reviewed by an admin.", 'success');
      } else {
        await axios.post(`${API_URL}/api/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast(t('success_product_create') || "Product successfully listed! It is now pending admin validation before appearing in the catalog.", 'success');
      }
      navigate('/my-articles');
    } catch (err: any) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.error || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-vintage-beige p-10 rounded-lg shadow-2xl relative border-4 border-double border-vintage-gold/30">
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-vintage-gold/50"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-vintage-gold/50"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-vintage-gold/50"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-vintage-gold/50"></div>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-cinzel text-vintage-gold-muted mb-2 tracking-widest uppercase">
            {isEditMode ? t('modify_item') || 'Modify Item' : t('create_product')}
          </h2>
          <div className="w-24 h-px bg-vintage-gold/40 mx-auto mt-4 relative">
             <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-vintage-gold/60">★</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/10 border border-red-900/40 text-red-900 text-sm font-lora italic text-center rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-vintage-gold-muted text-xs uppercase tracking-widest font-cinzel font-bold">
                {t('product_title')}
              </label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Typewriter Underwood No. 5"
                className="bg-black/90 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner transition-colors focus:bg-black placeholder:text-vintage-gold/80"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vintage-gold-muted text-xs uppercase tracking-widest font-cinzel font-bold">
                {t('product_year')}
              </label>
              <input
                required
                type="number"
                min="1800"
                max="2026"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 1920"
                className="bg-black/90 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner transition-colors focus:bg-black placeholder:text-vintage-gold/80"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-vintage-gold-muted text-xs uppercase tracking-widest font-cinzel font-bold">
                {t('product_price')}
              </label>
              <input
                required
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 450€"
                className="bg-black/90 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner transition-colors focus:bg-black placeholder:text-vintage-gold/80"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vintage-gold-muted text-xs uppercase tracking-widest font-cinzel font-bold">
                {t('product_category')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="bg-black/80 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner transition-colors focus:bg-black appearance-none cursor-pointer"
              >
                <option value="wat">{t('wat')}</option>
                <option value="tc">{t('tc')}</option>
                <option value="pho">{t('pho')}</option>
                <option value="art">{t('art')}</option>
                <option value="coi">{t('coi')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-vintage-gold-muted text-xs uppercase tracking-widest font-cinzel font-bold">
              {t('image_url')}
            </label>
            <input
              required
              type="file"
              accept="image/*"
              name="image"
              onChange={handleImageChange}
              className="bg-black/90 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner transition-colors focus:bg-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-vintage-gold file:text-black hover:file:bg-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-vintage-gold-muted text-xs uppercase tracking-widest font-cinzel font-bold">
              {t('product_description')}
            </label>
            <textarea
              required
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="..."
              className="bg-black/90 border border-vintage-gold text-white font-lora outline-none px-4 py-3 shadow-inner transition-colors focus:bg-black placeholder:text-vintage-gold/80 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="vintage-btn w-full py-5 !text-black font-cinzel font-bold text-lg tracking-[0.3em] bg-vintage-gold shadow-2xl hover:bg-white transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {loading ? t('saving') : (isEditMode ? t('update_product') || 'Update Item' : t('list_item'))}
          </button>
        </form>
      </div>
    </div>
  );
}
