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
  const [dailyStats, setDailyStats] = useState({ totalSales: 0, orderCount: 0 });
  const { socket, joinAdmin } = useSocket();

  useEffect(() => {
    fetchOrders();
    fetchDailyStats();
    
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
        // Refresh stats on any order update (especially completion)
        fetchDailyStats();
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

  const fetchDailyStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.get(`${API_URL}/api/orders/stats/daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyStats(data);
    } catch (error) {
      console.error('Failed to fetch daily stats:', error);
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
      if (newStatus === 'Completed') {
        fetchDailyStats();
      }
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
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
            Admin Dashboard
          </h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none glass-card px-4 py-3 rounded-2xl border border-chai/20 bg-chai/5">
              <span className="text-[9px] font-black uppercase tracking-widest text-chai/50 block mb-1">Today's Revenue</span>
              <span className="text-xl sm:text-2xl font-black text-white glow-chai">₹{dailyStats.totalSales}</span>
            </div>
            <div className="flex-1 sm:flex-none glass-card px-4 py-3 rounded-2xl border border-chai/20">
              <span className="text-[9px] font-black uppercase tracking-widest text-chai/50 block mb-1">Active</span>
              <span className="text-xl sm:text-2xl font-black text-white">{activeOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {['All', 'Pending', 'Accepted', 'Ready', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 border text-xs font-bold uppercase tracking-widest ${
                filter === status
                  ? 'bg-chai text-black border-chai shadow-[0_0_15px_rgba(220,176,126,0.2)]'
                  : 'bg-white/5 text-chai/60 border-white/10 hover:border-chai/30 hover:text-chai'
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`glass-card rounded-3xl p-5 sm:p-6 border-l-4 transition-all hover:glow-chai ${getStatusColor(order.status)}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-black text-white italic tracking-tighter truncate">
                    ORDER #{order._id.slice(-6)}
                  </h3>
                  <p className="text-xs text-chai/60 font-medium uppercase tracking-wider mt-1 truncate">
                    {order.user?.name || order.user?.email}
                  </p>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mt-2">
                    {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.placedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 ml-4 ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-chai/90 font-bold flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-chai/10 rounded-lg text-[10px]">{item.quantity}</span>
                      {item.name}
                    </span>
                    <span className="font-black text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-8 px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Total Value</span>
                <span className="text-2xl font-black text-chai glow-chai">₹{order.totalPrice}</span>
              </div>

              {/* Actions based on status */}
              {order.status === 'Pending' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order._id);
                      setPrepMinutes(15);
                    }}
                    className="flex-[2] bg-chai text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10"
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
                    className="flex-1 bg-white/5 border border-white/10 text-red-400 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                </div>
              )}

              {order.status === 'Accepted' && (
                <button
                  onClick={() => updateStatus(order._id, 'Ready')}
                  className="w-full bg-chai text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-chai/10"
                >
                  Mark as Ready
                </button>
              )}

              {order.status === 'Ready' && (
                <div className="space-y-4">
                  {order.pickupTime && (
                    <div className="flex items-center justify-center gap-2 py-2 bg-green-500/5 rounded-xl border border-green-500/10">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                       Pickup: {new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => updateStatus(order._id, 'Completed')}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-chai transition-all shadow-xl shadow-white/5"
                  >
                    Mark Completed
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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
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
                {actionLoading ? '...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setPrepMinutes(15);
                }}
                className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all uppercase text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
