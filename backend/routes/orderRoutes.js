const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrder,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  cancelOrder,
  getDailyStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/stats/daily', protect, admin, getDailyStats);
router.get('/:id', protect, getOrder);
router.post('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.patch('/:id/accept', protect, admin, acceptOrder);
router.patch('/:id/reject', protect, admin, rejectOrder);
router.patch('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
