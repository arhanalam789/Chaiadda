const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();

const updateRoles = async () => {
    try {
        await connectDB();

        // Update all users to have 'user' role if missing
        const userResult = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'user' } }
        );
        console.log(`Updated ${userResult.modifiedCount} users with default role.`);

        // Update all admins to have 'admin' role if missing
        const adminResult = await Admin.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'admin' } }
        );
        console.log(`Updated ${adminResult.modifiedCount} admins with default role.`);

        process.exit(0);
    } catch (error) {
        console.error('Error updating roles:', error);
        process.exit(1);
    }
};

updateRoles();
