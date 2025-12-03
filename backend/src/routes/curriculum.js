const express = require('express');
const router = express.Router();
const CurriculumTemplate = require('../models/CurriculumTemplate');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Create Curriculum Template
router.post('/templates', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const { name, description, items } = req.body;
        const template = await CurriculumTemplate.create({
            academy_id: req.user.academy_id,
            name,
            description,
            items
        });
        res.status(201).json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Templates
router.get('/templates', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const templates = await CurriculumTemplate.findByAcademy(req.user.academy_id);
        res.json(templates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Template Detail
router.get('/templates/:id', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const template = await CurriculumTemplate.findById(req.params.id);
        if (!template || template.academy_id !== req.user.academy_id) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign Curriculum to Student
router.post('/assign', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const { studentId, templateId } = req.body;
        await CurriculumTemplate.assignToStudent(studentId, templateId);
        res.json({ message: 'Curriculum assigned to student' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Student Curriculum Management

// Create curriculum for student
router.post('/students/:studentId', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { curriculumId, title, days, startDate, schedule } = req.body;

        console.log('Creating curriculum - Request data:', {
            studentId,
            curriculumId,
            title,
            days: Array.isArray(days) ? `Array(${days.length})` : days,
            startDate,
            hasSchedule: !!schedule
        });

        const database = require('../config/database');
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            const { v4: uuidv4 } = require('uuid');
            const id = uuidv4();

            const scheduleJson = JSON.stringify(schedule);
            const daysCount = Array.isArray(days) ? days.length : days;

            console.log('Inserting with:', {
                id,
                student_id: studentId,
                curriculum_id: curriculumId,
                title,
                days: daysCount,
                start_date: startDate,
                scheduleLength: scheduleJson.length
            });

            await connection.execute(
                `INSERT INTO student_curriculums (id, student_id, curriculum_id, title, days, start_date, schedule, created_at, updated_at)
                 VALUES (:id, :student_id, :curriculum_id, :title, :days, TO_DATE(:start_date, 'YYYY-MM-DD'), :schedule, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                {
                    id,
                    student_id: studentId,
                    curriculum_id: curriculumId,
                    title,
                    days: daysCount,
                    start_date: startDate,
                    schedule: scheduleJson
                }
            );

            console.log('INSERT successful, committing...');
            await connection.commit();
            console.log('Commit successful!');

            res.status(201).json({ id, studentId, curriculumId, title, days, startDate, schedule });
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error('Error creating curriculum:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all curriculums for student
router.get('/students/:studentId', auth, async (req, res) => {
    try {
        const { studentId } = req.params;

        if (req.user.role === ROLES.STUDENT && req.user.id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const database = require('../config/database');
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            const result = await connection.execute(
                `SELECT id, student_id, curriculum_id, title, days, 
                        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, 
                        TO_CHAR(schedule) as schedule_str, created_at, updated_at
                 FROM student_curriculums 
                 WHERE student_id = :student_id
                 ORDER BY created_at DESC`,
                { student_id: studentId },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            const curriculums = result.rows.map(row => {
                let scheduleData = {};
                try {
                    const scheduleStr = row.SCHEDULE_STR || row.schedule_str;
                    if (scheduleStr) {
                        scheduleData = JSON.parse(scheduleStr);
                    }
                } catch (e) {
                    console.error('Error parsing schedule for curriculum:', row.ID || row.id, e.message);
                    scheduleData = {};
                }

                return {
                    id: row.ID || row.id,
                    studentId: row.STUDENT_ID || row.student_id,
                    curriculumId: row.CURRICULUM_ID || row.curriculum_id,
                    title: row.TITLE || row.title,
                    days: scheduleData.days || row.DAYS || row.days,
                    startDate: row.START_DATE || row.start_date,
                    schedule: scheduleData,
                    createdAt: row.CREATED_AT || row.created_at,
                    updatedAt: row.UPDATED_AT || row.updated_at
                };
            });

            res.json(curriculums);
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error('Error fetching curriculums:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update curriculum
router.put('/students/:studentId/:curriculumId', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const { studentId, curriculumId } = req.params;
        const { title, days, startDate, schedule } = req.body;

        const database = require('../config/database');
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            const scheduleJson = JSON.stringify(schedule);
            const daysCount = Array.isArray(days) ? days.length : days;

            await connection.execute(
                `UPDATE student_curriculums 
                 SET title = :title, days = :days, start_date = TO_DATE(:start_date, 'YYYY-MM-DD'), 
                     schedule = :schedule, updated_at = CURRENT_TIMESTAMP
                 WHERE student_id = :student_id AND curriculum_id = :curriculum_id`,
                {
                    title,
                    days: daysCount,
                    start_date: startDate,
                    schedule: scheduleJson,
                    student_id: studentId,
                    curriculum_id: curriculumId
                }
            );

            await connection.commit();
            res.json({ message: 'Curriculum updated successfully' });
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error('Error updating curriculum:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete curriculum
router.delete('/students/:studentId/:curriculumId', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const { studentId, curriculumId } = req.params;

        const database = require('../config/database');
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            await connection.execute(
                `DELETE FROM student_curriculums 
                 WHERE student_id = :student_id AND curriculum_id = :curriculum_id`,
                { student_id: studentId, curriculum_id: curriculumId }
            );

            await connection.commit();
            res.json({ message: 'Curriculum deleted successfully' });
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error('Error deleting curriculum:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
