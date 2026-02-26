import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import AdminQueue from './pages/AdminQueue';
import AdminManagement from './pages/AdminManagement';
import UserDashboard from './pages/UserDashboard';
import ProductDetail from './pages/ProductDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateProduct from './pages/CreateProduct';
import MyProducts from './pages/MyProducts';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen selection:bg-vintage-gold selection:text-vintage-dark relative overflow-x-hidden">
        <Header />
        <main className="container mx-auto px-6 py-12 relative z-10 page-transition">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<AdminQueue />} />
            <Route path="/admin/management" element={<AdminManagement />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/list-item" element={<CreateProduct />} />
            <Route path="/my-articles" element={<MyProducts />} />
          </Routes>
        </main>
        
        {/* Decorative vertical lines on margins (simulating the timeline layout) */}
        <div className="fixed left-[5%] top-0 bottom-0 w-px bg-vintage-gold-muted opacity-10 pointer-events-none z-0 hidden lg:block"></div>
        <div className="fixed right-[5%] top-0 bottom-0 w-px bg-vintage-gold-muted opacity-10 pointer-events-none z-0 hidden lg:block"></div>
      </div>
    </ToastProvider>
  )
}

export default App;
