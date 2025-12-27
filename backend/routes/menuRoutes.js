const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getAvailableMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getMenuItems);
router.get('/available', getAvailableMenuItems);
router.get('/:id', getMenuItem);

// Admin only routes
router.post('/', protect, admin, createMenuItem);
router.put('/:id', protect, admin, updateMenuItem);
router.patch('/:id/availability', protect, admin, toggleAvailability);
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router;
