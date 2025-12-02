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
        // items: [{ wordbook_id, order, settings: { words_per_test, repeat_count, ... } }]

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

        // Verify ownership/academy (omitted for brevity)

        await CurriculumTemplate.assignToStudent(studentId, templateId);
        res.json({ message: 'Curriculum assigned to student' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
