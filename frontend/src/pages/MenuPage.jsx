import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);

  const categories = ['All', 'Beverages', 'Snacks', 'Meals', 'Desserts', 'Other'];

  useEffect(() => {
    fetchMenuItems();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/menu/available`);
      setMenuItems(data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

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
        { items: orderItems },
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl sticky top-0 z-40 border-b border-chai/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
              CHAI <span className="text-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]">ADDA</span>
            </h1>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative group bg-chai text-black px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10 text-xs"
            >
              Order Bag ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
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
              className={`px-6 py-2.5 rounded-2xl whitespace-nowrap transition-all font-black text-[10px] uppercase tracking-widest ${
                selectedCategory === cat
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-[2.5rem] overflow-hidden border border-chai/10 hover:border-chai/30 transition-all hover:glow-chai flex flex-col group"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-chai uppercase tracking-widest">
                  {item.category}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-white italic tracking-tighter mb-2">{item.name}</h3>
                <p className="text-xs text-chai/60 font-medium leading-relaxed mb-8 line-clamp-2">{item.description}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Standard Rate</span>
                    <span className="text-2xl font-black text-chai glow-chai">₹{item.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-chai/10 text-chai border border-chai/20 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-chai hover:text-black transition-all shadow-xl shadow-chai/5"
                  >
                    + Add to Bag
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
                      <p className="text-[10px] text-chai/40 font-black uppercase tracking-widest mt-1">Review your selections</p>
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
                      <p className="text-[10px] font-black text-chai/40 uppercase tracking-[0.3em]">Your bag is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item._id} className="glass-card rounded-2xl p-5 border border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-black text-white tracking-tight italic uppercase text-sm">{item.name}</h3>
                              <p className="text-chai font-black mt-1">₹{item.price}</p>
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
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Total Amount</span>
                        <span className="text-3xl font-black text-chai glow-chai">₹{getCartTotal()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Items</span>
                        <span className="text-xl font-black text-white">{cart.length} Labels</span>
                      </div>
                    </div>
                    <button
                      onClick={placeOrder}
                      className="w-full bg-chai text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10"
                    >
                      Confirm Order
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
