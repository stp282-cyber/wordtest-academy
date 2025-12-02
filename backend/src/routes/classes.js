const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Create Class
router.post('/', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const { name, description, teacher_id } = req.body;
        const newClass = await Class.create({
            academy_id: req.user.academy_id,
            name,
            description,
            teacher_id
        });
        res.status(201).json(newClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Classes
router.get('/', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const classes = await Class.findByAcademy(req.user.academy_id);
        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Student to Class
router.post('/:id/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const { studentId } = req.body;
        const classId = req.params.id;

        // Verify class belongs to academy
        const classObj = await Class.findById(classId);
        if (!classObj || classObj.academy_id !== req.user.academy_id) {
            return res.status(404).json({ message: 'Class not found' });
        }

        await Class.addStudent(classId, studentId);
        res.json({ message: 'Student added to class' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Students in Class
router.get('/:id/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const classId = req.params.id;
        const classObj = await Class.findById(classId);
        if (!classObj || classObj.academy_id !== req.user.academy_id) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const students = await Class.getStudents(classId);
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
