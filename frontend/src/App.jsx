import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
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
    <header className={`${isAdmin ? 'bg-black border-b border-chai/20' : 'bg-white shadow-sm'} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to={isAdmin ? '/admin/orders' : '/menu'} className={`text-2xl font-bold ${isAdmin ? 'text-chai' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Chai Adda
          </Link>

          <nav className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <Link to="/admin/orders" className="text-chai hover:text-white transition-colors font-medium">
                  Orders
                </Link>
                <Link to="/admin/menu" className="text-chai hover:text-white transition-colors font-medium">
                  Menu Management
                </Link>
              </>
            ) : (
              <>
                <Link to="/menu" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Menu
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-indigo-600 font-medium">
                  My Orders
                </Link>
              </>
            )}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<LoginPage />} />
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
