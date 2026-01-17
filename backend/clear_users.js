const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const clearUsers = async () => {
    await connectDB();
    const result = await User.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} users.`);
    process.exit();
};

clearUsers();
