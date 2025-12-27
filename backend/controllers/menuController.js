const MenuItem = require('../models/MenuItem');
const asyncHandler = require('express-async-handler');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({});
  res.json(menuItems);
});

// @desc    Get available menu items only
// @route   GET /api/menu/available
// @access  Public
const getAvailableMenuItems = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = { isAvailable: true };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const menuItems = await MenuItem.find(query);
  res.json(menuItems);
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  
  res.json(menuItem);
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, imageUrl } = req.body;
  
  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    category,
    imageUrl: imageUrl || undefined
  });
  
  res.status(201).json(menuItem);
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  
  const { name, description, price, category, imageUrl } = req.body;
  
  menuItem.name = name || menuItem.name;
  menuItem.description = description || menuItem.description;
  menuItem.price = price !== undefined ? price : menuItem.price;
  menuItem.category = category || menuItem.category;
  menuItem.imageUrl = imageUrl || menuItem.imageUrl;
  
  const updatedMenuItem = await menuItem.save();
  res.json(updatedMenuItem);
});

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private/Admin
const toggleAvailability = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  
  menuItem.isAvailable = !menuItem.isAvailable;
  const updatedMenuItem = await menuItem.save();
  
  res.json(updatedMenuItem);
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  
  await menuItem.deleteOne();
  res.json({ message: 'Menu item removed' });
});

module.exports = {
  getMenuItems,
  getAvailableMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem
};
