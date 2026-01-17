import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import API_URL from '../config';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        enrollmentNo: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, enrollmentNo, email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.endsWith('.rishihood.edu.in')) {
            toast.error('Please use your official email ID ending with .rishihood.edu.in');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/auth/signup`, formData);
            setLoading(false);
            toast.success('OTP sent to your email');
            navigate('/verify-signup', { state: { email } });
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-chai/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-chai/5 rounded-full blur-[120px] pointer-events-none"></div>

            {loading && <Loader />}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md overflow-hidden glass-card rounded-[2.5rem] shadow-2xl z-10 border border-chai/20"
            >
                <div className="px-8 py-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            CHAI <span className="text-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]">ADDA</span>
                        </h1>
                        <p className="mt-3 text-[10px] text-chai uppercase tracking-[0.3em] font-black">Create Account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20 font-bold"
                                placeholder="John Doe"
                                value={name}
                                onChange={onChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="enrollmentNo" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">
                                Enrollment No
                            </label>
                            <input
                                type="text"
                                id="enrollmentNo"
                                required
                                className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20 font-bold"
                                placeholder="2024NST001"
                                value={enrollmentNo}
                                onChange={onChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">
                                Official Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20 font-bold"
                                placeholder="name.rishihood.edu.in"
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[10px] font-black text-chai uppercase tracking-widest ml-1 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                className="w-full px-5 py-4 text-white bg-black border border-chai/20 rounded-2xl focus:ring-2 focus:ring-chai focus:border-transparent outline-none transition-all placeholder-chai/20 font-bold"
                                placeholder="••••••••"
                                value={password}
                                onChange={onChange}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-4 text-black font-black bg-chai rounded-2xl shadow-xl shadow-chai/10 transition-all uppercase tracking-widest mt-4"
                        >
                            Sign Up
                        </motion.button>

                        <div className="text-center mt-6">
                            <p className="text-[10px] text-chai/60 uppercase tracking-widest">
                                Already have an account?{' '}
                                <Link to="/" className="text-white font-black hover:text-chai transition-all underline underline-offset-4">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
