import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/admin/login', { email, password });
      console.log('Admin Login Success:', data);
      navigate('/admin/dashboard'); // Placeholder route
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-sm overflow-hidden bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="px-6 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-sm mt-1">Authorized Personnel Only</p>
          </div>
          
          {error && (
            <div className="p-3 mb-6 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-3 mt-1 text-white bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
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
                className="w-full px-4 py-3 mt-1 text-white bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all transform active:scale-95"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
