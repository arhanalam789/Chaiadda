const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const cleanupOrders = require('./utils/cleanup');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render load balancer)
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', // Vite default might switch ports
  'https://chaiadda.vercel.app',
  'https://chaiadda-1.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked Origin:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  const activeCount = io.engine.clientsCount;
  console.log(`Client connected: ${socket.id}. Total Active: ${activeCount}`);

  // Join admin room
  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log('Admin joined:', socket.id);
  });

  // Join user room
  socket.on('joinUser', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined:`, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Pass io to order controller
const orderController = require('./controllers/orderController');
orderController.setIO(io);

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Setup automatic cleanup (runs every hour)
setInterval(cleanupOrders, 60 * 60 * 1000);
// Run once on startup
cleanupOrders();

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
