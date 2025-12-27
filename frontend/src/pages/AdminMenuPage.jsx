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
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-chai tracking-tight">
            Menu Management
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-chai text-black px-6 py-2 rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-chai/10"
          >
            + Add New Item
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl overflow-hidden border border-chai/10 hover:border-chai/30 transition-all hover:glow-chai"
            >
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-52 object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  item.isAvailable
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {item.isAvailable ? 'INSTOCK' : 'OUTOFSTOCK'}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <p className="text-sm text-chai/60 line-clamp-2 h-10">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-black text-chai">₹{item.price}</span>
                  <span className="text-[10px] font-bold text-chai/40 border border-chai/20 px-2 py-0.5 rounded uppercase">{item.category}</span>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => toggleAvailability(item._id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                      item.isAvailable
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-4 py-2 bg-chai/10 text-chai rounded-xl hover:bg-chai hover:text-black transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold"
                  >
                    Fix
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card border border-chai/30 rounded-3xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">
              {editingItem ? 'Edit Product' : 'New Creation'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-chai/50 uppercase tracking-[0.2em] mb-2">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-chai/20 rounded-xl text-white focus:ring-2 focus:ring-chai outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-chai/50 uppercase tracking-[0.2em] mb-2">
                  Insight
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-black/50 border border-chai/20 rounded-xl text-white focus:ring-2 focus:ring-chai outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-chai/50 uppercase tracking-[0.2em] mb-2">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-chai/20 rounded-xl text-white focus:ring-2 focus:ring-chai outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-chai/50 uppercase tracking-[0.2em] mb-2">
                    Section
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-chai/20 rounded-xl text-white focus:ring-2 focus:ring-chai outline-none transition-all appearance-none"
                  >
                    <option>Beverages</option>
                    <option>Snacks</option>
                    <option>Meals</option>
                    <option>Desserts</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-chai/50 uppercase tracking-[0.2em] mb-2">
                  Media Source
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-black/50 border border-chai/20 rounded-xl text-white focus:ring-2 focus:ring-chai outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-[2] bg-chai text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all"
                >
                  {editingItem ? 'UPDATE' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all uppercase text-xs"
                >
                  EXIT
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
