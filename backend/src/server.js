const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
// const database = require('./config/database'); // Real DB
const database = require('./config/mockDatabase'); // Mock DB for testing
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Initialization
(async () => {
    try {
        await database.initialize();
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/academies', require('./routes/academies'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/wordbooks', require('./routes/wordbooks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/users')); // Alias for students
app.use('/api/progress', require('./routes/progress'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/games', require('./routes/games'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/analytics', require('./routes/analytics'));

// Socket.io
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing...');
    await database.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
