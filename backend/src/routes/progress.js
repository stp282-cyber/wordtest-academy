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

        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            // Get student progress from DB
            const result = await connection.execute(
                `SELECT id, student_id, curriculum_id, current_day, completed_days, 
                        TO_CHAR(last_study_date, 'YYYY-MM-DD') as last_study_date,
                        TO_CHAR(progress_data) as progress_data_str
                 FROM student_progress 
                 WHERE student_id = :student_id`,
                { student_id: studentId },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            const progressList = result.rows.map(row => {
                let progressData = {};
                try {
                    const dataStr = row.PROGRESS_DATA_STR || row.progress_data_str;
                    if (dataStr) {
                        progressData = JSON.parse(dataStr);
                    }
                } catch (e) {
                    console.error('Error parsing progress data:', e.message);
                }

                return {
                    id: row.ID || row.id,
                    studentId: row.STUDENT_ID || row.student_id,
                    curriculumId: row.CURRICULUM_ID || row.curriculum_id,
                    currentDay: row.CURRENT_DAY || row.current_day,
                    completedDays: row.COMPLETED_DAYS || row.completed_days,
                    lastStudyDate: row.LAST_STUDY_DATE || row.last_study_date,
                    progressData
                };
            });

            res.json(progressList);
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Student Progress
router.put('/student/:id', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER, ROLES.STUDENT]), async (req, res) => {
    try {
        const studentId = req.params.id;
        const { curriculumId, currentDay, completedDays, progressData } = req.body;

        // Access Control
        if (req.user.role === ROLES.STUDENT && req.user.id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            const { v4: uuidv4 } = require('uuid');

            // Check if progress exists
            const checkResult = await connection.execute(
                `SELECT id FROM student_progress WHERE student_id = :student_id AND curriculum_id = :curriculum_id`,
                { student_id: studentId, curriculum_id: curriculumId },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            const progressDataJson = JSON.stringify(progressData || {});

            if (checkResult.rows.length > 0) {
                // Update existing progress
                await connection.execute(
                    `UPDATE student_progress 
                     SET current_day = :current_day, 
                         completed_days = :completed_days,
                         last_study_date = CURRENT_DATE,
                         progress_data = :progress_data,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE student_id = :student_id AND curriculum_id = :curriculum_id`,
                    {
                        current_day: currentDay,
                        completed_days: completedDays,
                        progress_data: progressDataJson,
                        student_id: studentId,
                        curriculum_id: curriculumId
                    }
                );
            } else {
                // Create new progress
                const id = uuidv4();
                await connection.execute(
                    `INSERT INTO student_progress (id, student_id, curriculum_id, current_day, completed_days, last_study_date, progress_data, created_at, updated_at)
                     VALUES (:id, :student_id, :curriculum_id, :current_day, :completed_days, CURRENT_DATE, :progress_data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    {
                        id,
                        student_id: studentId,
                        curriculum_id: curriculumId,
                        current_day: currentDay,
                        completed_days: completedDays,
                        progress_data: progressDataJson
                    }
                );
            }

            await connection.commit();
            res.json({ message: 'Progress updated successfully' });
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Class Log Data (for ClassLogModal)
router.get('/class-log/:studentId/:curriculumId', auth, async (req, res) => {
    try {
        const { studentId, curriculumId } = req.params;
        const { weeks = 4 } = req.query; // Default 4 weeks

        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            // Get curriculum data
            const currResult = await connection.execute(
                `SELECT id, student_id, curriculum_id, title, days, 
                        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                        TO_CHAR(schedule) as schedule_str
                 FROM student_curriculums 
                 WHERE student_id = :student_id AND curriculum_id = :curriculum_id`,
                { student_id: studentId, curriculum_id: curriculumId },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            if (currResult.rows.length === 0) {
                return res.status(404).json({ message: 'Curriculum not found' });
            }

            const curriculum = currResult.rows[0];
            let schedule = {};
            try {
                const scheduleStr = curriculum.SCHEDULE_STR || curriculum.schedule_str;
                if (scheduleStr) {
                    schedule = JSON.parse(scheduleStr);
                }
            } catch (e) {
                console.error('Error parsing schedule:', e.message);
            }

            // Get progress data
            const progResult = await connection.execute(
                `SELECT current_day, completed_days, 
                        TO_CHAR(last_study_date, 'YYYY-MM-DD') as last_study_date,
                        TO_CHAR(progress_data) as progress_data_str
                 FROM student_progress 
                 WHERE student_id = :student_id AND curriculum_id = :curriculum_id`,
                { student_id: studentId, curriculum_id: curriculumId },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            let progress = {
                currentDay: 0,
                completedDays: 0,
                lastStudyDate: null,
                progressData: {}
            };

            if (progResult.rows.length > 0) {
                const row = progResult.rows[0];
                progress.currentDay = row.CURRENT_DAY || row.current_day || 0;
                progress.completedDays = row.COMPLETED_DAYS || row.completed_days || 0;
                progress.lastStudyDate = row.LAST_STUDY_DATE || row.last_study_date;

                try {
                    const dataStr = row.PROGRESS_DATA_STR || row.progress_data_str;
                    if (dataStr) {
                        progress.progressData = JSON.parse(dataStr);
                    }
                } catch (e) {
                    console.error('Error parsing progress data:', e.message);
                }
            }

            res.json({
                curriculum: {
                    id: curriculum.ID || curriculum.id,
                    studentId: curriculum.STUDENT_ID || curriculum.student_id,
                    curriculumId: curriculum.CURRICULUM_ID || curriculum.curriculum_id,
                    title: curriculum.TITLE || curriculum.title,
                    days: curriculum.DAYS || curriculum.days,
                    startDate: curriculum.START_DATE || curriculum.start_date,
                    schedule
                },
                progress,
                weeks: parseInt(weeks)
            });
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Students Progress (Summary for Admin)
router.get('/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            // Get all students with their progress
            const sql = `
                SELECT u.id, u.full_name, u.email,
                       COUNT(DISTINCT sp.curriculum_id) as active_curriculums,
                       MAX(sp.last_study_date) as last_study_date
                FROM users u
                LEFT JOIN student_progress sp ON u.id = sp.student_id
                WHERE u.academy_id = :academyId AND u.role = 'student'
                GROUP BY u.id, u.full_name, u.email
                ORDER BY u.full_name
            `;

            const result = await connection.execute(
                sql,
                { academyId: req.user.academy_id },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
            );

            const students = result.rows.map(row => ({
                id: row.ID || row.id,
                fullName: row.FULL_NAME || row.full_name,
                email: row.EMAIL || row.email,
                activeCurriculums: row.ACTIVE_CURRICULUMS || row.active_curriculums || 0,
                lastStudyDate: row.LAST_STUDY_DATE || row.last_study_date
            }));

            res.json(students);
        } finally {
            if (connection) await connection.close();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
