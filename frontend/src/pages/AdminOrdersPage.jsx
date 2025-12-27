import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import API_URL from '../config';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [prepMinutes, setPrepMinutes] = useState(15);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { socket, joinAdmin } = useSocket();

  useEffect(() => {
    fetchOrders();
    
    // Join admin room for real-time updates
    if (socket) {
      joinAdmin();
      
      // Listen for new orders
      socket.on('newOrder', (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        toast.success('New order received!', {
          icon: '🔔',
          duration: 4000
        });
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      });
      
      // Listen for order updates
      socket.on('orderUpdate', (updatedOrder) => {
        setOrders(prev =>
          prev.map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderUpdate');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      const pickupTime = new Date();
      pickupTime.setMinutes(pickupTime.getMinutes() + parseInt(prepMinutes));
      
      console.log('Accepting order:', orderId, 'prep minutes:', prepMinutes, 'target time:', pickupTime);
      
      await axios.patch(
        `${API_URL}/api/orders/${orderId}/accept`,
        { pickupTime: pickupTime.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order accepted');
      setSelectedOrder(null);
      setPrepMinutes(15);
      fetchOrders();
    } catch (error) {
      console.error('Accept Order Error:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectOrder = async (orderId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `${API_URL}/api/orders/${orderId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order rejected');
      setSelectedOrder(null);
      setRejectionReason('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'border-yellow-500/30 text-yellow-500',
      Accepted: 'border-blue-500/30 text-blue-500',
      Rejected: 'border-red-500/30 text-red-500',
      Preparing: 'border-purple-500/30 text-purple-500',
      Ready: 'border-green-500/30 text-green-500',
      Completed: 'border-gray-500/30 text-gray-500',
      Cancelled: 'border-red-500/30 text-red-500'
    };
    return colors[status] || 'border-gray-500/30 text-gray-400';
  };

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(order => order.status === filter);

  const activeOrders = orders.filter(o =>
    ['Pending', 'Accepted', 'Ready'].includes(o.status)
  );

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
            Admin Dashboard
          </h1>
          <div className="glass-card px-4 py-2 rounded-xl border border-chai/20">
            <span className="text-sm text-chai/70">Active Orders:</span>
            <span className="ml-2 text-2xl font-bold text-white">{activeOrders.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'Pending', 'Accepted', 'Ready', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 border ${
                filter === status
                  ? 'bg-chai text-black border-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]'
                  : 'bg-transparent text-chai border-chai/30 hover:border-chai'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass-card rounded-2xl p-6 border-l-4 transition-all hover:glow-chai ${getStatusColor(order.status)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-chai/80">
                    Customer: {order.user?.name || order.user?.email}
                  </p>
                  <p className="text-xs text-chai/50">
                    {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4 bg-black/40 rounded-xl p-4 border border-white/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-chai/90">{item.quantity}x {item.name}</span>
                    <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-chai/70">Total Amount:</span>
                <span className="text-2xl font-black text-chai glow-chai">₹{order.totalPrice}</span>
              </div>

              {/* Actions based on status */}
              {order.status === 'Pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedOrder(order._id);
                      setPrepMinutes(15);
                    }}
                    className="flex-1 bg-chai text-black py-3 rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-chai/10"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        setRejectionReason(reason);
                        rejectOrder(order._id);
                      }
                    }}
                    className="flex-1 bg-transparent border border-red-500/50 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                </div>
              )}

              {order.status === 'Accepted' && (
                <button
                  onClick={() => updateStatus(order._id, 'Ready')}
                  className="w-full bg-chai text-black py-3 rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-chai/10"
                >
                  Mark as Ready
                </button>
              )}

              {order.status === 'Ready' && (
                <div>
                  {order.pickupTime && (
                    <p className="text-sm text-chai/70 mb-3 italic">
                     Expected Completion: {new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <button
                    onClick={() => updateStatus(order._id, 'Completed')}
                    className="w-full bg-transparent border border-chai text-chai py-3 rounded-xl font-bold hover:bg-chai hover:text-black transition-all"
                  >
                    Complete Transaction
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-xl">No {filter.toLowerCase()} orders</p>
          </div>
        )}
      </div>

      {/* Accept Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card border border-chai/30 rounded-3xl p-8 max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-black text-white mb-6">Preparation Time</h3>
            <label className="block text-sm font-bold text-chai mb-3 uppercase tracking-widest">
              Set Minutes
            </label>
            <div className="flex items-center gap-4 mb-8">
              <input
                type="number"
                min="1"
                max="120"
                value={prepMinutes}
                onChange={(e) => setPrepMinutes(e.target.value)}
                className="w-full px-5 py-4 bg-black border border-chai/20 rounded-2xl text-white text-xl font-bold focus:ring-2 focus:ring-chai focus:outline-none"
              />
              <span className="text-chai/60 font-medium">MINS</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => acceptOrder(selectedOrder)}
                disabled={actionLoading}
                className="flex-[2] bg-chai text-black py-4 rounded-2xl font-black hover:bg-white transition-all shadow-xl"
              >
                {actionLoading ? '...' : 'CONFIRM ACCESS'}
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setPrepMinutes(15);
                }}
                className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
