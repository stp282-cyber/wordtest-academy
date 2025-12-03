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

// Create Student (Academy Admin or Super Admin)
router.post('/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const { username, password, full_name, phone, email, academy_id } = req.body;

        // Determine academy_id: Super Admin can specify, or use default if not provided
        let targetAcademyId;
        if (req.user.role === ROLES.SUPER_ADMIN) {
            targetAcademyId = academy_id || 'academy-default-001'; // Use default academy if not specified
        } else {
            targetAcademyId = req.user.academy_id;
        }

        // Check if username exists in this academy
        const existingUser = await User.findByUsername(username, targetAcademyId);
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists in this academy' });
        }

        const newUser = await User.create({
            academy_id: targetAcademyId,
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
router.get('/students', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        // Super Admin can see all students, others see only their academy
        if (req.user.role === ROLES.SUPER_ADMIN) {
            const students = await User.findAll();
            // Filter only students
            const studentList = students.filter(u => u.role === ROLES.STUDENT);
            res.json(studentList);
        } else {
            const students = await User.findByAcademy(req.user.academy_id, ROLES.STUDENT);
            res.json(students);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Student
router.put('/students/:id', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Ensure student belongs to this academy (skip check for Super Admin)
        if (req.user.role !== ROLES.SUPER_ADMIN && student.academy_id !== req.user.academy_id) {
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
router.delete('/students/:id', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Ensure student belongs to this academy (skip check for Super Admin)
        if (req.user.role !== ROLES.SUPER_ADMIN && student.academy_id !== req.user.academy_id) {
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
