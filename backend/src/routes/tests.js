const express = require('express');
const router = express.Router();
const TestService = require('../services/TestService');
const TestResult = require('../models/TestResult');
const auth = require('../middleware/auth');

// Generate Test
router.post('/generate', auth, async (req, res) => {
    try {
        const { wordbookId, type, count } = req.body;
        const testQuestions = await TestService.generateTest(wordbookId, type, count || 20);
        res.json(testQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit Test
router.post('/submit', auth, async (req, res) => {
    try {
        const { wordbookId, type, answers, isReview } = req.body;
        // answers: [{ wordId, userAnswer, correctAnswer }]

        const gradingResult = TestService.gradeTest(answers);

        const result = await TestResult.create({
            student_id: req.user.id,
            academy_id: req.user.academy_id,
            wordbook_id: wordbookId,
            test_type: type,
            score: gradingResult.score,
            total_questions: gradingResult.total,
            correct_count: gradingResult.correctCount,
            wrong_count: gradingResult.wrongCount,
            is_review: isReview,
            details: { results: gradingResult.results }
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Test Results
router.get('/results', auth, async (req, res) => {
    try {
        const results = await TestResult.findByStudent(req.user.id);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
