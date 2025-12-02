const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const database = require('../config/database');

// Start Game (Get settings/words)
router.post('/start', auth, async (req, res) => {
    try {
        const { gameType, difficulty } = req.body;
        // Fetch words based on difficulty or random
        // Mock response
        res.json({
            gameId: 'game_' + Date.now(),
            words: [], // Should fetch words
            settings: { timeLimit: 60 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit Game Result
router.post('/submit', auth, async (req, res) => {
    try {
        const { gameType, score, difficulty } = req.body;

        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Save game result (simplified table not in initial schema, but good to have)
        // For now, just trigger reward check

        // Calculate reward based on difficulty
        let rewardAmount = 0;
        if (difficulty === 'easy') rewardAmount = 1;
        if (difficulty === 'medium') rewardAmount = 2;
        if (difficulty === 'hard') rewardAmount = 3;

        if (rewardAmount > 0) {
            // Call RewardService (or direct insert for now)
            const { v4: uuidv4 } = require('uuid');
            const sql = `
            INSERT INTO dollar_history (id, student_id, amount, reason)
            VALUES (:id, :studentId, :amount, :reason)
        `;
            await connection.execute(sql, {
                id: uuidv4(),
                studentId: req.user.id,
                amount: rewardAmount,
                reason: `game_win_${gameType}`
            });
            await connection.commit();
        }

        await connection.close();

        res.json({ message: 'Game result saved', rewardEarned: rewardAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
