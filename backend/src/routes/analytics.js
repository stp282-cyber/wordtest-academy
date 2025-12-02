const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');
// const database = require('../config/database');
const database = require('../config/mockDatabase');

// Academy Analytics
router.get('/academy', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Example: Average score per class
        const sql = `
        SELECT c.name as class_name, AVG(tr.score) as avg_score
        FROM classes c
        JOIN class_students cs ON c.id = cs.class_id
        JOIN test_results tr ON cs.student_id = tr.student_id
        WHERE c.academy_id = :academyId
        GROUP BY c.name
    `;

        const result = await connection.execute(sql, { academyId: req.user.academy_id });
        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Student Analytics
router.get('/student/:id', auth, async (req, res) => {
    try {
        // Check permission
        if (req.user.role === ROLES.STUDENT && req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Score history
        const sql = `
        SELECT taken_at, score, test_type
        FROM test_results
        WHERE student_id = :studentId
        ORDER BY taken_at ASC
    `;

        const result = await connection.execute(sql, { studentId: req.params.id });
        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
