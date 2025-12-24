import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Loader from '../components/Loader';
import API_URL from '../config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!email.endsWith('@nst.rishihood.edu.in')) {
        toast.error('Please use your official college email ID.');
        return;
      }
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/login`, { email });
      setLoading(false);
      setShowOtp(true);
      toast.success('OTP sent successfully!');
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/auth/verify`, { email, otp });
      setLoading(false);
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      toast.success('Login Successful!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Background Shapes */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
      ></motion.div>
      <motion.div 
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
      ></motion.div>
      <motion.div 
        animate={{ x: [0, 50, 0], y: [0, 100, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
      ></motion.div>

      <Toaster position="top-center" reverseOrder={false} />
      {loading && <Loader />}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl z-10 border border-white/20"
      >
        <div className="px-6 py-8 md:px-8">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Chai Adda
            </h1>
            <p className="mt-2 text-sm text-gray-600 font-medium">Canteen Login</p>
          </div>

          <AnimatePresence mode="wait">
            {!showOtp ? (
              <motion.form 
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleEmailSubmit} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    College ID
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="student@nst.rishihood.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Use your official university email.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3.5 text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Send OTP
                </motion.button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleOtpSubmit} 
                className="space-y-6"
              >
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 mt-1 text-center text-2xl tracking-widest bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all hover:bg-white"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="mt-3 text-xs text-center text-gray-500">
                    Code sent to <span className="font-medium text-gray-700">{email}</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3.5 text-white font-bold bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Verify & Login
                </motion.button>
                <div className="text-center">
                   <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-sm text-gray-500 hover:text-purple-600 transition-colors underline decoration-dotted"
                  >
                    Start Over
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
