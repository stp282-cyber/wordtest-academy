const express = require('express');
const router = express.Router();
const RewardService = require('../services/RewardService');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Get Balance
router.get('/balance', auth, async (req, res) => {
    try {
        const balance = await RewardService.getBalance(req.user.id);
        res.json({ balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get History
router.get('/history', auth, async (req, res) => {
    try {
        const history = await RewardService.getHistory(req.user.id);
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Manual Grant (Academy Admin)
router.post('/manual', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const { studentId, amount, reason } = req.body;

        // Verify student belongs to academy (omitted)

        await RewardService.earnReward(studentId, amount, reason || 'manual_grant');
        res.json({ message: 'Reward granted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
