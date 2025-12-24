import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import API_URL from '../config';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/admin/login`, { email, password });
      localStorage.setItem('adminInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      toast.success('Admin Access Granted');
      setTimeout(() => navigate('/admin/dashboard'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900 relative overflow-hidden">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm overflow-hidden bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 z-10"
      >
        <div className="px-6 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white tracking-wider">
              ADMIN <span className="text-blue-500">PORTAL</span>
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-2">Authorized Personnel Only</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-3 mt-1 text-white bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 focus:bg-gray-900"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                id="password"
                required
                className="w-full px-4 py-3 mt-1 text-white bg-gray-900/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 focus:bg-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 text-white font-bold bg-blue-600 rounded-xl shadow-lg transition-all"
            >
              Access Dashboard
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
