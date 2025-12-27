import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email });
      setLoading(false);
      setShowOtp(true);
      toast.success('OTP sent to your email');
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
      setTimeout(() => navigate('/menu'), 1000);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black relative overflow-hidden">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Decorative Glows */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-chai/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-chai/5 rounded-full blur-[120px] pointer-events-none"></div>



      {loading && <Loader />}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm overflow-hidden glass-card rounded-[2.5rem] shadow-2xl z-10 border border-chai/20"
      >
        <div className="px-8 py-10">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              CHAI <span className="text-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]">ADDA</span>
            </h1>
            <p className="mt-3 text-[10px] text-chai uppercase tracking-[0.3em] font-black">Canteen Access</p>
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
                  <label htmlFor="email" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">
                    Official ID
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20 font-bold"
                      placeholder="identity@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="mt-3 text-[9px] text-chai/60 uppercase tracking-widest ml-1">
                    Use your university email address.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 text-black font-black bg-chai rounded-2xl shadow-xl shadow-chai/10 transition-all uppercase tracking-widest"
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
                <div className="space-y-6">
                  <div>
                    <label htmlFor="otp" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2 text-center">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      required
                      maxLength={6}
                      className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all text-center text-3xl font-black tracking-[0.5em] placeholder-chai/10"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <p className="mt-4 text-[9px] text-center text-chai/60 uppercase tracking-widest">
                      Sent to: <span className="text-white font-bold">{email}</span>
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 text-black font-black bg-chai rounded-2xl shadow-xl shadow-chai/10 transition-all uppercase tracking-widest"
                  >
                    Verify Account
                  </motion.button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-[9px] font-black text-chai/60 hover:text-chai transition-all uppercase tracking-[0.2em] decoration-chai/40 underline underline-offset-4"
                    >
                      Change Account
                    </button>
                  </div>
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
