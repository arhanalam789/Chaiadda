import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';

const AdminMenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Beverages',
    imageUrl: ''
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/menu`);
      setMenuItems(data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingItem) {
        await axios.put(
          `${API_URL}/api/menu/${editingItem._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Item updated');
      } else {
        await axios.post(
          `${API_URL}/api/menu`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Item added');
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const toggleAvailability = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `${API_URL}/api/menu/${id}/availability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Availability updated');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item deleted');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Beverages',
      imageUrl: ''
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-chai">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
            Menu Management
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-chai text-black px-8 py-4 sm:py-2.5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10 text-xs"
          >
            + Add New Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-3xl overflow-hidden border border-chai/10 hover:border-chai/30 transition-all hover:glow-chai flex flex-col"
            >
              <div className="relative group overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-56 sm:h-52 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                  item.isAvailable
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-white italic tracking-tighter">{item.name}</h3>
                  <span className="text-[9px] font-black text-white/30 border border-white/10 px-2 py-1 rounded-lg uppercase tracking-widest">{item.category}</span>
                </div>
                <p className="text-xs text-chai/60 font-medium line-clamp-2 leading-relaxed mb-6">{item.description}</p>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Price</span>
                    <span className="text-2xl font-black text-chai glow-chai">₹{item.price}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAvailability(item._id)}
                      className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        item.isAvailable
                          ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-black'
                      }`}
                    >
                      {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 py-4 bg-chai/10 text-chai border border-chai/20 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-chai hover:text-black transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl flex items-center justify-center z-[100] px-4 py-8 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-card border border-chai/30 rounded-[2.5rem] p-6 sm:p-10 max-w-lg w-full my-auto shadow-[0_20px_50px_rgba(220,176,126,0.1)]"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">
              {editingItem ? 'Edit Product' : 'Add New Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-chai/40 uppercase tracking-[0.3em] mb-2 px-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-chai outline-none transition-all placeholder-white/10"
                    placeholder="Masala Chai"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-chai/40 uppercase tracking-[0.3em] mb-2 px-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-chai outline-none transition-all resize-none placeholder-white/10"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-chai/40 uppercase tracking-[0.3em] mb-2 px-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-chai outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-chai/40 uppercase tracking-[0.3em] mb-2 px-1">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-chai outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option className="bg-black">Beverages</option>
                        <option className="bg-black">Snacks</option>
                        <option className="bg-black">Meals</option>
                        <option className="bg-black">Desserts</option>
                        <option className="bg-black">Other</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-chai/50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-chai/40 uppercase tracking-[0.3em] mb-2 px-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images..."
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-2 focus:ring-chai outline-none transition-all placeholder-white/5 text-xs truncate"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-[2] bg-chai text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10"
                >
                  {editingItem ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Exit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuPage;
