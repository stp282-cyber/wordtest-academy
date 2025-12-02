const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');
const database = require('../config/database');

// Get Student Progress (Detailed)
router.get('/student/:id', auth, async (req, res) => {
    try {
        const studentId = req.params.id;

        // Access Control
        if (req.user.role === ROLES.STUDENT && req.user.id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if ([ROLES.ACADEMY_ADMIN, ROLES.TEACHER].includes(req.user.role)) {
            // Verify academy match (omitted for brevity, assume middleware handles or check DB)
        }

        // Mock response for now as we haven't implemented full curriculum tracking yet
        // In real implementation, query student_curriculum, test_results, etc.
        const progressData = {
            studentId: studentId,
            todayCompleted: false,
            currentProgress: 45, // %
            behindSchedule: [
                { id: 'item_1', name: 'Lesson 5', daysLate: 2 }
            ],
            upcomingLessons: [
                { id: 'item_2', name: 'Lesson 6', date: '2023-10-27' }
            ]
        };

        res.json(progressData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Students Progress (Summary for Admin)
router.get('/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        // This would aggregate progress for all students in the academy
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Example query to get latest test result date for each student
        const sql = `
        SELECT u.id, u.full_name, 
               (SELECT MAX(taken_at) FROM test_results WHERE student_id = u.id) as last_test_date
        FROM users u
        WHERE u.academy_id = :academyId AND u.role = 'student'
    `;

        const result = await connection.execute(sql, { academyId: req.user.academy_id });
        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
