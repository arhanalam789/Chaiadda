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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Menu
            </h1>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold text-indigo-600">₹{item.price}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-indigo-600 font-bold">₹{item.price}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                          >
                            −
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                          >
                            +
                          </button>
                          <span className="ml-auto font-bold">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{getCartTotal()}
                    </span>
                  </div>
                  <button
                    onClick={placeOrder}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
