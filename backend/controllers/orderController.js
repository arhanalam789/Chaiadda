const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');

// This will be set by server.js
let io;

const setIO = (socketIO) => {
  io = socketIO;
};

// @desc    Place new order
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { items, notes, scheduledTime } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate and calculate total
  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);

    if (!menuItem) {
      res.status(404);
      throw new Error(`Menu item not found: ${item.menuItem}`);
    }

    if (!menuItem.isAvailable) {
      res.status(400);
      throw new Error(`${menuItem.name} is currently unavailable`);
    }

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price
    });

    totalPrice += menuItem.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    userModel: req.user.role === 'admin' ? 'Admin' : 'User',
    items: orderItems,
    totalPrice,
    notes,
    status: 'Pending',
    isScheduled: !!scheduledTime,
    scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl');

  // Emit real-time notification to admin
  if (io) {
    io.to('admin').emit('newOrder', populatedOrder);
  }

  res.status(201).json(populatedOrder);
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.menuItem', 'name imageUrl')
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = status ? { status } : {};

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl')
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is order owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Accept order and set pickup time
// @route   PATCH /api/orders/:id/accept
// @access  Private/Admin
const acceptOrder = asyncHandler(async (req, res) => {
  const { pickupTime } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'Pending') {
    res.status(400);
    throw new Error('Order cannot be accepted in current status');
  }

  order.status = 'Accepted';
  order.acceptedAt = Date.now();
  order.pickupTime = pickupTime;

  const updatedOrder = await order.save();

  // Emit real-time notification to user
  if (io && order.user) {
    const userId = order.user._id || order.user;
    io.to(`user_${userId}`).emit('orderUpdate', updatedOrder);
  }

  res.json(updatedOrder);
});

// @desc    Reject order
// @route   PATCH /api/orders/:id/reject
// @access  Private/Admin
const rejectOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'Pending') {
    res.status(400);
    throw new Error('Order cannot be rejected in current status');
  }

  order.status = 'Rejected';
  order.rejectionReason = reason || 'No reason provided';

  const updatedOrder = await order.save();

  // Emit real-time notification to user
  if (io && order.user) {
    const userId = order.user._id || order.user;
    io.to(`user_${userId}`).emit('orderUpdate', updatedOrder);
  }

  res.json(updatedOrder);
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validStatuses = ['Ready', 'Completed'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  order.status = status;

  if (status === 'Ready') {
    order.readyAt = Date.now();
  } else if (status === 'Completed') {
    order.completedAt = Date.now();
  }

  const updatedOrder = await order.save();

  // Emit real-time notification to user
  if (io && order.user) {
    const userId = order.user._id || order.user;
    io.to(`user_${userId}`).emit('orderUpdate', updatedOrder);
    io.to('admin').emit('orderUpdate', updatedOrder);
  }

  res.json(updatedOrder);
});

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name imageUrl');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is order owner
  if (order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.status !== 'Pending') {
    res.status(400);
    throw new Error('Can only cancel pending orders');
  }

  order.status = 'Cancelled';
  const updatedOrder = await order.save();

  // Emit real-time notification to admin
  if (io) {
    io.to('admin').emit('orderUpdate', updatedOrder);
  }

  res.json(updatedOrder);
});

// @desc    Get daily sales statistics
// @route   GET /api/orders/stats/daily
// @access  Private/Admin
const getDailyStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const stats = await Order.aggregate([
    {
      $match: {
        status: 'Completed',
        placedAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 }
      }
    }
  ]);

  res.json({
    totalSales: stats.length > 0 ? stats[0].totalSales : 0,
    orderCount: stats.length > 0 ? stats[0].orderCount : 0
  });
});

module.exports = {
  setIO,
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrder,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  cancelOrder,
  getDailyStats
};
