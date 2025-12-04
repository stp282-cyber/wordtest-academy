const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Get All Users (Super Admin only)
router.get('/', auth, requireRole([ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Student (Academy Admin only)
router.post('/students', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
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

// Get Teachers (Academy Admins and Teachers)
router.get('/teachers', auth, async (req, res) => {
    try {
        // In a real DB we would use OR, but for mock DB we might need to fetch all and filter
        // Or use the existing findByAcademy and filter in memory if needed, 
        // but let's try to use a direct query if the mock DB supports it or just reuse findByAcademy twice.

        // Let's use User.findByAcademy for now, assuming we want ACADEMY_ADMIN and TEACHER
        // Since findByAcademy takes a single role, we might need to call it twice or update it.
        // For simplicity, let's just fetch ACADEMY_ADMINs for now as "Teachers" for the student view.

        const admins = await User.findByAcademy(req.user.academy_id, ROLES.ACADEMY_ADMIN);
        const teachers = await User.findByAcademy(req.user.academy_id, ROLES.TEACHER);

        const allTeachers = [...admins, ...teachers];

        res.json(allTeachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Students in Academy
router.get('/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const students = await User.findByAcademy(req.user.academy_id, ROLES.STUDENT);
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Single Student by ID
router.get('/students/:id', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

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
router.put('/students/:id', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
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
router.delete('/students/:id', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
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
