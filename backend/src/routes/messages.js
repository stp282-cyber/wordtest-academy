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

        const sql = `
        SELECT * FROM messages
        WHERE sender_id = :userId OR receiver_id = :userId
        ORDER BY sent_at DESC
    `;

        const result = await connection.execute(sql, { userId: req.user.id });
        const messages = result.rows;

        // Group by other user
        const conversations = {};
        for (const msg of messages) {
            const otherId = msg.SENDER_ID === req.user.id ? msg.RECEIVER_ID : msg.SENDER_ID;
            if (!conversations[otherId]) {
                // Fetch user details
                const userSql = `SELECT * FROM users WHERE id = :id`;
                const userResult = await connection.execute(userSql, { id: otherId });
                const user = userResult.rows[0];

                conversations[otherId] = {
                    userId: otherId,
                    name: user ? (user.NAME || user.FULL_NAME) : 'Unknown',
                    lastMessage: msg.CONTENT,
                    lastMessageTime: msg.SENT_AT,
                    unreadCount: 0 // TODO: Implement unread count
                };
            }
        }

        await connection.close();

        res.json(Object.values(conversations));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Messages with specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        const sql = `
        SELECT * FROM messages
        WHERE (sender_id = :myId AND receiver_id = :otherId)
           OR (sender_id = :otherId AND receiver_id = :myId)
        ORDER BY sent_at ASC
    `;

        const result = await connection.execute(sql, {
            myId: req.user.id,
            otherId: req.params.userId
        });

        await connection.close();

        // Map to frontend friendly format
        const messages = result.rows.map(row => ({
            id: row.ID,
            senderId: row.SENDER_ID,
            receiverId: row.RECEIVER_ID,
            content: row.CONTENT,
            timestamp: row.SENT_AT,
            isMine: row.SENDER_ID === req.user.id
        }));

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
