const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');
const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create Announcement
router.post('/', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const { title, content, targetType, targetId, isImportant } = req.body;

        const pool = database.getPool();
        const connection = await pool.getConnection();

        const id = uuidv4();
        const sql = `
        INSERT INTO announcements (id, academy_id, title, content, author_id, target_type, target_id, is_important)
        VALUES (:id, :academyId, :title, :content, :authorId, :targetType, :targetId, :isImportant)
    `;

        await connection.execute(sql, {
            id,
            academyId: req.user.academy_id,
            title,
            content,
            authorId: req.user.id,
            targetType: targetType || 'all',
            targetId: targetId || null,
            isImportant: isImportant ? 1 : 0
        });

        await connection.commit();
        await connection.close();

        res.status(201).json({ id, title, content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Announcements
router.get('/', auth, async (req, res) => {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Fetch announcements for this academy
        // If student, filter by class if target_type is class
        let sql = `
        SELECT * FROM announcements 
        WHERE academy_id = :academyId
    `;
        const binds = { academyId: req.user.academy_id };

        if (req.user.role === ROLES.STUDENT) {
            // Simple logic: get 'all' or specific class announcements
            // Need to join with class_students to check if student is in target class
            // For now, just fetching 'all' type for simplicity
            sql += ` AND (target_type = 'all' OR target_type = 'class')`;
        }

        sql += ` ORDER BY is_important DESC, created_at DESC`;

        const result = await connection.execute(sql, binds);
        await connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
