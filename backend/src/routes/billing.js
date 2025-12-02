const express = require('express');
const router = express.Router();
const BillingService = require('../services/BillingService');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Super Admin can calculate and view billing for any academy
// Academy Admin can view their own billing

router.post('/calculate/:academyId', auth, requireRole([ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const { academyId } = req.params;
        const { yearMonth } = req.body; // YYYY-MM

        if (!yearMonth) {
            return res.status(400).json({ message: 'YearMonth (YYYY-MM) is required' });
        }

        const result = await BillingService.calculateMonthlyBilling(academyId, yearMonth);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/usage/:academyId/:yearMonth', auth, async (req, res) => {
    try {
        const { academyId, yearMonth } = req.params;

        // Access Control
        if (req.user.role !== ROLES.SUPER_ADMIN) {
            if (req.user.academy_id !== academyId) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const usage = await BillingService.getUsage(academyId, yearMonth);
        if (!usage) {
            return res.status(404).json({ message: 'Usage data not found' });
        }
        res.json(usage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
