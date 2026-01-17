import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
      setTimeout(() => navigate('/admin/orders'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm overflow-hidden glass-card rounded-3xl shadow-2xl border border-chai/20 z-10"
      >
        <div className="px-8 py-10">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              ADMIN <span className="text-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]">PORTAL</span>
            </h1>
            <p className="text-chai text-[10px] uppercase tracking-[0.3em] font-black mt-3">Admin Login Required</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20"
                placeholder="identity@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">Password</label>
              <input
                type="password"
                id="password"
                required
                className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 text-black font-black bg-chai rounded-2xl shadow-xl shadow-chai/10 transition-all uppercase tracking-widest"
            >
              Login
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
