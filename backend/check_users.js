const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const checkUsers = async () => {
    await connectDB();
    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(u => {
        console.log(`- ${u.email} (${u.enrollmentNo})`);
    });
    process.exit();
};

checkUsers();
