const express = require('express');
const router = express.Router();
const listeningTestController = require('../controllers/listeningTestController');
const auth = require('../middleware/auth');

// Generate Test Questions (Text)
// POST /api/listening/generate
router.post('/generate', auth, listeningTestController.generateTest);

// Generate Audio (TTS)
// POST /api/listening/audio
router.post('/audio', auth, listeningTestController.generateAudio);

// Assign Test
// POST /api/listening/assign
router.post('/assign', auth, listeningTestController.assignTest);

// Get Assignments
// GET /api/listening/assignments/:studentId
router.get('/assignments/:studentId', auth, listeningTestController.getAssignments);

module.exports = router;
