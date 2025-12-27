import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import API_URL from '../config';
import Loader from '../components/Loader';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, joinUser } = useSocket();

  useEffect(() => {
    fetchOrders();
    
    // Join user room for real-time updates
    const userId = getUserId();
    if (userId && socket) {
      joinUser(userId);
      
      // Listen for order updates
      socket.on('orderUpdate', (updatedOrder) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
        toast.success(`Order status updated: ${updatedOrder.status}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('orderUpdate');
      }
    };
  }, [socket]);

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_URL}/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Accepted: 'bg-blue-100 text-blue-800',
      Rejected: 'bg-red-100 text-red-800',
      Ready: 'bg-green-100 text-green-800',
      Completed: 'bg-gray-100 text-gray-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10">
          My <span className="text-chai shadow-[0_0_15px_rgba(220,176,126,0.3)]">Orders</span>
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl grayscale opacity-20">📜</span>
            </div>
            <p className="text-[10px] font-black text-chai/60 uppercase tracking-[0.3em]">No orders recorded yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-[2.5rem] p-6 sm:p-8 border-l-4 border-chai/20 transition-all hover:glow-chai"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
                      Label: #{order._id.slice(-6)}
                    </h3>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-1">
                      {new Date(order.placedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    order.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    order.status === 'Ready' ? 'bg-chai/10 text-chai border-chai/20 animate-pulse' :
                    'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-8">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-xs font-black text-chai uppercase italic tracking-tight">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-xs font-black text-chai/60">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block mb-1">Total Bill</span>
                      <span className="text-2xl font-black text-chai glow-chai">₹{order.totalPrice}</span>
                    </div>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all"
                      >
                        Retract
                      </button>
                    )}
                  </div>

                  {order.pickupTime && (
                    <div className="bg-chai/5 border border-chai/10 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-chai animate-ping"></div>
                      <p className="text-[10px] font-black text-chai uppercase tracking-widest">
                        Ready for Pickup: {new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  {order.rejectionReason && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mt-4">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                        Note: {order.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
