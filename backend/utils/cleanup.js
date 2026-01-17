const Order = require('../models/Order');

const cleanupOrders = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await Order.deleteMany({
            status: { $in: ['Completed', 'Rejected', 'Cancelled'] },
            createdAt: { $lt: twentyFourHoursAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${result.deletedCount} old orders.`);
        }
    } catch (error) {
        console.error('[Cleanup Error]:', error);
    }
};

module.exports = cleanupOrders;
