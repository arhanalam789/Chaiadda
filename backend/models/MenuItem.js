const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Beverages', 'Snacks', 'Meals', 'Desserts', 'Other']
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
