const express = require('express');
const router = express.Router();
const Wordbook = require('../models/Wordbook');
const Word = require('../models/Word');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');
const multer = require('multer');
const upload = multer({ dest: '/tmp/' }); // Use /tmp for Vercel serverless
const ExcelService = require('../services/ExcelService');
const fs = require('fs');

// --- Shared Wordbooks (Super Admin) ---

// Create Shared Wordbook
router.post('/shared', auth, requireRole([ROLES.SUPER_ADMIN]), async (req, res) => {
    try {
        const { name, description } = req.body;
        const wordbook = await Wordbook.create({
            name,
            description,
            is_shared: true,
            created_by: req.user.id
        });
        res.status(201).json(wordbook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Shared Wordbooks
router.get('/shared', auth, async (req, res) => {
    try {
        const wordbooks = await Wordbook.findShared();
        res.json(wordbooks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Academy Wordbooks (Academy Admin) ---

// Create Academy Wordbook
router.post('/academy', auth, requireRole([ROLES.ACADEMY_ADMIN]), async (req, res) => {
    try {
        const { name, description } = req.body;
        const wordbook = await Wordbook.create({
            name,
            description,
            academy_id: req.user.academy_id,
            is_shared: false,
            created_by: req.user.id
        });
        res.status(201).json(wordbook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Academy Wordbooks
router.get('/academy', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER, ROLES.STUDENT]), async (req, res) => {
    try {
        const wordbooks = await Wordbook.findByAcademy(req.user.academy_id);
        res.json(wordbooks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Words Management ---

// Add Word to Wordbook
router.post('/:id/words', auth, async (req, res) => {
    try {
        const wordbookId = req.params.id;
        const wordbook = await Wordbook.findById(wordbookId);

        if (!wordbook) return res.status(404).json({ message: 'Wordbook not found' });

        // Check permissions
        if (wordbook.is_shared) {
            if (req.user.role !== ROLES.SUPER_ADMIN) return res.status(403).json({ message: 'Only Super Admin can edit shared wordbooks' });
        } else {
            if (wordbook.academy_id !== req.user.academy_id) return res.status(403).json({ message: 'Access denied' });
            if (![ROLES.ACADEMY_ADMIN, ROLES.TEACHER].includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const word = await Word.create({
            wordbook_id: wordbookId,
            ...req.body
        });
        res.status(201).json(word);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Words in Wordbook
router.get('/:id/words', auth, async (req, res) => {
    try {
        // Permission check omitted for brevity (should check if user has access to this wordbook)
        const words = await Word.findByWordbook(req.params.id);
        res.json(words);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Excel Upload ---

router.post('/upload-excel', auth, requireRole([ROLES.ACADEMY_ADMIN, ROLES.TEACHER]), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { name, description } = req.body;

        // Create Wordbook first
        const wordbook = await Wordbook.create({
            name: name || req.file.originalname,
            description,
            academy_id: req.user.academy_id,
            is_shared: false,
            created_by: req.user.id
        });

        // Process Excel
        const count = await ExcelService.parseAndSaveWordbook(req.file.path, wordbook.id);

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.status(201).json({ message: `Wordbook created with ${count} words`, wordbookId: wordbook.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/template', async (req, res) => {
    try {
        const workbook = await ExcelService.createTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=wordbook_template.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
