const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash || user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const payload = {
            user: {
                id: user.id,
                academy_id: user.academy_id,
                role: user.role,
                username: user.username
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '12h' });

        const responseUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            academy_id: user.academy_id,
            full_name: user.full_name
        };
        console.log('Login successful. Sending user:', responseUser);

        res.json({
            token,
            user: responseUser
        });

    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            username: req.body.username
        });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Current User
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
