const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const menuItems = [
    // Beverages
    {
        name: 'Masala Chai',
        description: 'Authentic Indian spiced tea brewed with fresh ginger, cardamom, and cinnamon.',
        price: 49,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Cutting Chai',
        description: 'Strong, street-style tea served in traditional small glasses.',
        price: 29,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1596711677364-d871d3748252?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Iced Lemon Tea',
        description: 'Refreshing cold tea with a zesty lemon punch.',
        price: 89,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Kullad Coffee',
        description: 'Hot coffee served in an earthen clay cup for an earthy aroma.',
        price: 69,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1629896739679-565bbe8cb1cb?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Mango Lassi',
        description: 'Thick and creamy yogurt-based drink made with fresh mango pulp.',
        price: 119,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1626139598888-25f0e137cce1?w=800&q=80',
        isAvailable: true
    },

    // Snacks
    {
        name: 'Bun Maska',
        description: 'Fresh bun slathered with generous amounts of butter.',
        price: 59,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1626202157971-b9cbdb564756?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Vada Pav',
        description: 'Mumbai’s favorite spicy potato fritter in a soft bun with chutneys.',
        price: 45,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1606509652259-253457a6279e?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Samosa Plate',
        description: 'Two crispy samosas served with tangy tamarind and mint chutneys.',
        price: 55,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Masala Fries',
        description: 'Crispy french fries tossed in our secret spice mix.',
        price: 99,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Peri Peri Maggi',
        description: 'Classic Maggi noodles with a spicy peri-peri twist.',
        price: 89,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&q=80',
        isAvailable: true
    },

    // Meals
    {
        name: 'Paneer Butter Masala Bowl',
        description: 'Rich paneer gravy served with cumin rice.',
        price: 189,
        category: 'Meals',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Rajma Chawal',
        description: 'Homestyle red kidney beans curry served with aromatic plain rice.',
        price: 159,
        category: 'Meals',
        imageUrl: 'https://images.unsplash.com/photo-1688647610078-4db81d5807af?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Chole Bhature',
        description: 'Spicy chickpea curry served with two large fluffy fried breads.',
        price: 179,
        category: 'Meals',
        imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Veg Biryani',
        description: 'Aromatic basmati rice cooked with fresh mixed vegetables and spices.',
        price: 199,
        category: 'Meals',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
        isAvailable: true
    },

    // Desserts
    {
        name: 'Chocolate Brownie',
        description: 'Gooey chocolate fudge brownie served warm.',
        price: 109,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e304abd?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Gulab Jamun',
        description: 'Soft milk solids dumplings soaked in rose-flavored sugar syrup.',
        price: 69,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Rasmalai',
        description: 'Soft cottage cheese patties immersed in sweetened, saffron-infused milk.',
        price: 89,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80',
        isAvailable: true
    },

    // Other
    {
        name: 'Masala Papad',
        description: 'Roasted papad topped with chopped onions, tomatoes, and spices.',
        price: 39,
        category: 'Other',
        imageUrl: 'https://images.unsplash.com/photo-1586955373970-13d8d69f0674?w=800&q=80',
        isAvailable: true
    },
    {
        name: 'Extra Pav',
        description: 'Pair of soft buttered buns.',
        price: 25,
        category: 'Other',
        imageUrl: 'https://images.unsplash.com/photo-1557161678-7956ddba019a?w=800&q=80',
        isAvailable: true
    }
];

const seedDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Clear existing items
        await MenuItem.deleteMany({});
        console.log('Existing menu items cleared');

        // Insert new items
        await MenuItem.insertMany(menuItems);
        console.log(`Imported ${menuItems.length} menu items!`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedDB();
