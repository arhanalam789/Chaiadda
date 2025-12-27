import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import API_URL from '../config';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-xl">No orders yet</p>
            <p className="mt-2">Start by browsing our menu!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order._id.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.placedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-600">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-indigo-600">₹{order.totalPrice}</span>
                  </div>

                  {order.pickupTime && (
                    <p className="text-sm text-gray-600">
                      Pickup by: {new Date(order.pickupTime).toLocaleString()}
                    </p>
                  )}

                  {order.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Reason: {order.rejectionReason}
                    </p>
                  )}

                  {order.status === 'Pending' && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Cancel Order
                    </button>
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
