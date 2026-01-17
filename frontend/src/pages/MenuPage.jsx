import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import Loader from '../components/Loader';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pickupType, setPickupType] = useState('now');
  const [scheduledTime, setScheduledTime] = useState('');

  const containerStats = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemStats = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const categories = ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts', 'Other'];

  useEffect(() => {
    fetchMenuItems();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchMenuItems = async (search = '') => {
    try {
      const { data } = await axios.get(`${API_URL}/api/menu/available`, {
        params: { search }
      });
      setMenuItems(data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenuItems(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToCart = (item) => {
    const existingItem = cart.find(c => c._id === item._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(c =>
        c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      newCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, delta) => {
    const newCart = cart.map(item => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(item => item._id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Item removed');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 1; i <= 24; i++) { // 15-min intervals for 6 hours
      const time = new Date(now.getTime() + i * 15 * 60000);
      options.push({
        label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: time.toISOString()
      });
    }
    return options;
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to place order');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        menuItem: item._id,
        quantity: item.quantity
      }));

      await axios.post(
        `${API_URL}/api/orders`,
        {
          items: orderItems,
          scheduledTime: pickupType === 'later' ? scheduledTime : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order placed successfully!');
      setCart([]);
      localStorage.removeItem('cart');
      setShowCart(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl sticky top-0 z-40 border-b border-chai/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md group">
              <input
                type="text"
                placeholder="Find your favorite chai or snack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-xs font-bold focus:bg-white/10 focus:border-chai/30 transition-all outline-none placeholder-white/20"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-chai transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setShowCart(!showCart)}
              className="w-full sm:w-auto relative group bg-chai text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10 text-[10px] tap-effect"
            >
              Order Bag ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black animate-bounce shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl whitespace-nowrap transition-all font-black text-[10px] uppercase tracking-widest ${selectedCategory === cat
                ? 'bg-chai text-black shadow-lg shadow-chai/20'
                : 'bg-white/5 text-chai/60 border border-white/5 hover:bg-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          key={selectedCategory}
          variants={containerStats}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              variants={itemStats}
              className="glass-card rounded-[2.5rem] overflow-hidden border border-chai/10 hover:border-chai/30 transition-all hover:glow-chai flex flex-col group"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-chai/90 border border-chai/30 text-[9px] font-black text-black uppercase tracking-widest shadow-lg">
                  {item.category}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-chai italic tracking-tighter mb-2">{item.name}</h3>
                <p className="text-xs text-white/70 font-medium leading-relaxed mb-8 line-clamp-2">{item.description}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Standard Rate</span>
                    <span className="text-2xl font-black text-chai glow-chai">₹{item.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-chai/10 text-chai border border-chai/20 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-chai hover:text-black transition-all shadow-xl shadow-chai/5 tap-effect"
                  >
                    + Add to Bag
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100]" onClick={() => setShowCart(false)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full sm:w-[450px] bg-black border-l border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Order Bag</h2>
                      <p className="text-[10px] text-chai/60 font-black uppercase tracking-widest mt-1">Review your selections</p>
                    </div>
                    <button
                      onClick={() => setShowCart(false)}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <span className="text-3xl grayscale opacity-20">🛒</span>
                      </div>
                      <p className="text-[10px] font-black text-chai/60 uppercase tracking-[0.3em]">Your bag is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item._id} className="glass-card rounded-2xl p-5 border border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-black text-chai tracking-tight italic uppercase text-sm">{item.name}</h3>
                              <p className="text-white font-black mt-1">₹{item.price}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-500/40 hover:text-red-500 transition-colors p-2"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                              <button
                                onClick={() => updateQuantity(item._id, -1)}
                                className="w-8 h-8 rounded-lg bg-black text-chai flex items-center justify-center font-black hover:bg-white transition-all"
                              >
                                −
                              </button>
                              <span className="font-black text-white w-4 text-center text-xs">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, 1)}
                                className="w-8 h-8 rounded-lg bg-black text-chai flex items-center justify-center font-black hover:bg-white transition-all"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-black text-white text-sm">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-8 border-t border-white/5 bg-black">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Total Amount</span>
                        <span className="text-3xl font-black text-chai glow-chai">₹{getCartTotal()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Items</span>
                        <span className="text-xl font-black text-white">{cart.length} Labels</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPickupType('now')}
                          className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all ${pickupType === 'now'
                            ? 'bg-chai text-black border-chai shadow-lg shadow-chai/10'
                            : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                            }`}
                        >
                          Pickup Now
                        </button>
                        <button
                          onClick={() => setPickupType('later')}
                          className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all ${pickupType === 'later'
                            ? 'bg-chai text-black border-chai shadow-lg shadow-chai/10'
                            : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                            }`}
                        >
                          Pickup Later
                        </button>
                      </div>

                      {pickupType === 'later' && (
                        <div className="animate-in slide-in-from-top duration-300">
                          <label className="text-[9px] font-black text-chai uppercase tracking-widest block mb-2 px-1">Choose Pickup Time (Within 6 Hours)</label>
                          <select
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:border-chai/30 transition-all outline-none appearance-none"
                          >
                            <option value="" className="bg-black">Select a time</option>
                            {generateTimeOptions().map(time => (
                              <option key={time.value} value={time.value} className="bg-black">
                                {time.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={placeOrder}
                      disabled={pickupType === 'later' && !scheduledTime}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${pickupType === 'later' && !scheduledTime
                        ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                        : 'bg-chai text-black hover:bg-white shadow-chai/10'
                        }`}
                    >
                      {pickupType === 'later' ? 'Schedule Order' : 'Confirm Order'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
