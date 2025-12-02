const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Send Message
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Verify receiver is in same academy (omitted)

        const id = uuidv4();
        const sql = `
        INSERT INTO messages (id, academy_id, sender_id, receiver_id, content)
        VALUES (:id, :academyId, :senderId, :receiverId, :content)
    `;

        await connection.execute(sql, {
            id,
            academyId: req.user.academy_id,
            senderId: req.user.id,
            receiverId,
            content
        });

        await connection.commit();
        await connection.close();

        // Socket.io emission should happen here (via req.app.get('io') or similar)
        // const io = req.app.get('io');
        // io.to(receiverId).emit('newMessage', { ... });

        res.status(201).json({ message: 'Message sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Conversations (List of users chatted with)
router.get('/conversations', auth, async (req, res) => {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Complex query to get latest message per user
        // Simplified: Get all messages involving user
        const sql = `
        SELECT * FROM messages
        WHERE sender_id = :userId OR receiver_id = :userId
        ORDER BY sent_at DESC
    `;

        const result = await connection.execute(sql, { userId: req.user.id });
        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
