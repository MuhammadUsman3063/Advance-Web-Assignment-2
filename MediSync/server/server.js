const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
// --- NAYE IMPORTS SOCKET.IO KE LIYE ---
const http = require('http'); 
const { Server } = require('socket.io'); 

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- SOCKET.IO SETUP ---
// 1. Express app ko HTTP server ke andar wrap kiya
const server = http.createServer(app); 

// 2. Socket.io ko initialize kiya aur frontend ka URL allow kiya
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 3. Connection Logic (Jab bhi koi naya tab khulega, yeh chalega)
io.on('connection', (socket) => {
  console.log('🔗 A user connected:', socket.id);

  // Jab frontend se 'update_queue' ka signal aaye...
  socket.on('update_queue', () => {
    console.log('🔄 Queue update signal received, broadcasting to all screens...');
    // ...toh sab connected screens (Doctor aur Receptionist) ko 'queue_refreshed' ka signal bhej do
    io.emit('queue_refreshed'); 
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});
// -----------------------

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

const startCronJobs = require('./cronJobs');
startCronJobs(io);


const PORT = process.env.PORT || 5000;

// YAHAN app.listen KI JAGAH server.listen AAYEGA
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});