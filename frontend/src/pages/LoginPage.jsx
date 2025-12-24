import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!email.endsWith('@nst.rishihood.edu.in')) {
        setError('Please use your official college email ID.');
        return;
      }
      await axios.post('http://localhost:5000/api/auth/login', { email });
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/verify', { email, otp });
      // Save user info/token (TODO: Use Context or Redux)
      console.log('Login Success:', data);
      navigate('/dashboard'); // Placeholder route
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-sm overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
        <div className="px-6 py-8 md:px-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Chai Adda
            </h1>
            <p className="mt-2 text-sm text-gray-500">Canteen Login</p>
          </div>
          
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              {error}
            </div>
          )}

          {!showOtp ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  College ID
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="student@nst.rishihood.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Use your official university email.
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all duration-200"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-fade-in-up">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 mt-1 text-center text-2xl tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <p className="mt-3 text-xs text-center text-gray-500">
                  Code sent to <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 text-white font-bold bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all duration-200"
              >
                Verify & Login
              </button>
              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Start Over
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
