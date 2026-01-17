import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminMenuPage from './pages/AdminMenuPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = token && getUserRole() === 'admin';

  function getUserRole() {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'user';
    } catch (e) {
      return 'user';
    }
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    navigate('/');
  };

  if (!token) return null;

  return (
    <header className="bg-black/90 backdrop-blur-xl border-b border-chai/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-5 gap-4">
          <Link to={isAdmin ? '/admin/orders' : '/menu'} className="text-2xl font-black text-white italic uppercase tracking-tighter">
            CHAI <span className="text-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]">ADDA</span>
          </Link>

          <nav className="flex items-center justify-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar py-2 sm:py-0">
            {isAdmin ? (
              <>
                <Link to="/admin/orders" className="text-chai hover:text-white transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  Orders
                </Link>
                <Link to="/admin/menu" className="text-chai hover:text-white transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  Menu
                </Link>
              </>
            ) : (
              <>
                <Link to="/menu" className="text-chai hover:text-white transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  Menu
                </Link>
                <Link to="/orders" className="text-chai hover:text-white transition-all font-black uppercase tracking-widest text-[9px] whitespace-nowrap px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  Orders
                </Link>
              </>
            )}
            <button
              onClick={logout}
              className="ml-2 sm:ml-4 font-black uppercase tracking-widest text-[9px] px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <SocketProvider>
      <Router>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-black">
          <Header />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-signup" element={<OtpVerificationPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />

            {/* User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/menu" element={<AdminMenuPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
