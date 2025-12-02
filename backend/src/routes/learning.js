const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Word = require('../models/Word');
// const database = require('../config/database');
const database = require('../config/mockDatabase');

// Get Words for Today's Learning
router.get('/words', auth, async (req, res) => {
    try {
        // Logic to fetch words based on student's curriculum progress
        // For now, just fetch words from the first wordbook in their curriculum
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Simplified: Get first active curriculum template -> first item -> wordbook
        const sql = `
        SELECT ci.wordbook_id
        FROM student_curriculum sc
        JOIN curriculum_items ci ON sc.template_id = ci.template_id
        WHERE sc.student_id = :studentId AND sc.status = 'active'
        ORDER BY ci.order_index ASC
        FETCH FIRST 1 ROWS ONLY
    `;

        const result = await connection.execute(sql, { studentId: req.user.id });

        let wordbookId;
        if (result.rows.length > 0) {
            wordbookId = result.rows[0].WORDBOOK_ID;
        } else {
            // Fallback: Get the first available wordbook in the system
            const fallbackSql = `SELECT id FROM wordbooks FETCH FIRST 1 ROWS ONLY`;
            const fallbackResult = await connection.execute(fallbackSql);

            if (fallbackResult.rows.length > 0) {
                wordbookId = fallbackResult.rows[0].ID;
            } else {
                await connection.close();
                return res.json([]); // No wordbooks at all
            }
        }

        await connection.close();

        const words = await Word.findByWordbook(wordbookId);
        res.json(words);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Record Learning Session (e.g., Flashcard completion)
router.post('/session', auth, async (req, res) => {
    try {
        const { wordbookId, durationSeconds } = req.body;

        const pool = database.getPool();
        const connection = await pool.getConnection();

        const id = require('uuid').v4();
        const sql = `
        INSERT INTO study_logs (id, student_id, wordbook_id, duration_seconds)
        VALUES (:id, :studentId, :wordbookId, :durationSeconds)
    `;

        await connection.execute(sql, {
            id,
            studentId: req.user.id,
            wordbookId,
            durationSeconds
        });

        await connection.commit();
        await connection.close();

        res.json({ message: 'Session recorded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
