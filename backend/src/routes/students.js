const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Create Student (Academy Admin only)
router.post('/', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const { username, password, full_name, phone, email } = req.body;

        // Check if username exists in this academy
        const existingUser = await User.findByUsername(username, req.user.academy_id);
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists in this academy' });
        }

        const newUser = await User.create({
            academy_id: req.user.academy_id,
            username,
            password, // Should be simple number password as per requirements
            full_name,
            role: ROLES.STUDENT,
            phone,
            email
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Students in Academy
router.get('/', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        console.log('GET /api/students called');
        console.log('User:', req.user);
        const students = await User.findByAcademy(req.user.academy_id, ROLES.STUDENT);
        console.log(`Found ${students.length} students`);
        res.json(students);
    } catch (error) {
        console.error('Error in GET /api/students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Single Student
router.get('/:id', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Ensure student belongs to this academy
        if (student.academy_id !== req.user.academy_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Student
router.put('/:id', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Ensure student belongs to this academy
        if (student.academy_id !== req.user.academy_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedStudent = await User.update(req.params.id, req.body);
        res.json(updatedStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Student
router.delete('/:id', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (student.academy_id !== req.user.academy_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await User.delete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
