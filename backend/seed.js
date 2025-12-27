const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');
const connectDB = require('./config/db');

dotenv.config();

const menuItems = [
  // Beverages
  { name: 'Masala/Ginger Tea', description: 'Traditional Indian spiced tea', price: 20, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400' },
  { name: 'Kulhad Tea', description: 'Tea served in traditional clay cup', price: 30, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1597318114145-88e39c92b6c5?w=400' },
  { name: 'Hot Coffee', description: 'Freshly brewed hot coffee', price: 30, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
  { name: 'Black Hot Coffee (300ml)', description: 'Strong black coffee', price: 50, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
  { name: 'Cold Coffee (300ml)', description: 'Refreshing iced coffee', price: 80, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400' },
  { name: 'Cold Coffee with Ice Cream (300ml)', description: 'Cold coffee topped with ice cream', price: 80, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1578373175032-98d9c78c6831?w=400' },
  { name: 'Hot Chocolate (300ml)', description: 'Rich hot chocolate drink', price: 70, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400' },
  { name: 'Cold Chocolate (300ml)', description: 'Chilled chocolate drink', price: 60, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400' },
  { name: 'Hot Bournvita (300ml)', description: 'Hot malted chocolate drink', price: 70, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400' },
  { name: 'Cold Bournvita (300ml)', description: 'Chilled malted chocolate drink', price: 80, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400' },
  { name: 'Plain Milk (300ml)', description: 'Fresh plain milk', price: 30, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { name: 'Banana Shake (300ml)', description: 'Creamy banana milkshake', price: 90, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400' },
  { name: 'Oreo Shake (300ml)', description: 'Oreo cookie milkshake', price: 60, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400' },
  { name: 'Kit-Kat Shake (300ml)', description: 'Kit-Kat chocolate milkshake', price: 70, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400' },

  // Burgers
  { name: 'Aloo Tikki Burger', description: 'Potato patty burger', price: 60, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { name: 'Paneer Burger', description: 'Cottage cheese burger', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400' },
  { name: 'Veg Burger', description: 'Mixed vegetable burger', price: 60, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Aloo Tikki Schezwan Burger', description: 'Spicy schezwan potato burger', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400' },
  { name: 'Crispy Paneer Burger', description: 'Crispy fried paneer burger', price: 99, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },

  // Sandwiches
  { name: 'Aloo Tikki Sandwich', description: 'Potato patty sandwich', price: 60, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
  { name: 'Paneer Sandwich', description: 'Cottage cheese sandwich', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400' },
  { name: 'Veg Sandwich', description: 'Mixed vegetable sandwich', price: 60, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400' },
  { name: 'Aloo Tikki Paneer Sandwich', description: 'Potato and paneer sandwich', price: 80, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=400' },

  // Maggi
  { name: 'Plain/Masala Maggi', description: 'Classic Maggi noodles', price: 40, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1672363353068-c960146cffcc?w=400' },
  { name: 'Cheese Maggi', description: 'Maggi with cheese', price: 50, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1682554167156-809e6394ee77?w=400' },
  { name: 'Makhni Masala Maggi', description: 'Creamy butter masala Maggi', price: 60, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1672363353068-c960146cffcc?w=400' },
  { name: 'Chattapati Achari Maggi', description: 'Tangy pickle flavored Maggi', price: 60, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1682554167156-809e6394ee77?w=400' },
  { name: 'Cheese Butter Maggi', description: 'Maggi with cheese and butter', price: 70, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1672363353068-c960146cffcc?w=400' },

  // Wraps
  { name: 'Chilli Garlic Wrap', description: 'Spicy garlic wrap', price: 80, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
  { name: 'Veg Cheese Wrap', description: 'Vegetable cheese wrap', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400' },
  { name: 'Paneer Cheese Wrap', description: 'Paneer cheese wrap', price: 99, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
  { name: 'Crinkle Fries', description: 'Crispy crinkle cut fries', price: 99, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },

  // Fries
  { name: 'French Fries', description: 'Classic french fries', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
  { name: 'Peri Peri Fries', description: 'Spicy peri peri fries', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a1c20d?w=400' },
  { name: 'Cheese Fries', description: 'Fries with cheese sauce', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
  { name: 'Spring Roll (6 Pcs)', description: 'Crispy vegetable spring rolls', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
  { name: 'Veggie Fingers (6 Pcs)', description: 'Fried vegetable fingers', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1619740455993-9e8c6c328806?w=400' },
  { name: 'Smiley Fries (6 Pcs)', description: 'Fun smiley shaped fries', price: 80, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1619881795090-cc4f762f20ba?w=400' },
  { name: 'Chilli Garlic Potatos (15 Pcs)', description: 'Spicy garlic potato bites', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1630409346491-9e4c6a2c89f1?w=400' },
  { name: 'Pizza Pockets (5pcs)', description: 'Mini pizza pockets', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  { name: 'Cheese Nuggets (7 Pcs)', description: 'Crispy cheese nuggets', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },

  // Momos
  { name: 'Veg Fried Momo (7 Pcs)', description: 'Fried vegetable momos', price: 80, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a0ea91d3e?w=400' },
  { name: 'Cheese Corn Momo (7 Pcs)', description: 'Cheese and corn momos', price: 99, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400' },
  { name: 'Veg Kurkure Momo (7 Pcs)', description: 'Crispy kurkure coated momos', price: 99, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a0ea91d3e?w=400' },
  { name: 'Paneer Momo (7 Pcs)', description: 'Paneer filled momos', price: 99, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400' },
  { name: 'Onion Rings (7 Pcs)', description: 'Crispy onion rings', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
  { name: 'Patal Kabab (7 Pcs)', description: 'Spicy potato kababs', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' }
];

const seedMenu = async () => {
  try {
    await connectDB();

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert new menu items
    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`✅ Successfully seeded ${inserted.length} menu items!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding menu:', error);
    process.exit(1);
  }
};

seedMenu();
