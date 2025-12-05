const express = require('express');
const cors = require('cors');
const database = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://wordtest-academy.vercel.app'],
    credentials: true
}));
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Routes - Temporarily commented out for debugging
/*
app.use('/api/auth', require('./routes/auth'));
app.use('/api/academies', require('./routes/academies'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/wordbooks', require('./routes/wordbooks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/users'));
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
app.use('/api/listening', require('./routes/listeningTests'));
*/

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!', message: err.message });
});

// For Vercel serverless
module.exports = app;

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
