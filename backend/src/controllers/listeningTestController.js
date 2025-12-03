const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EdgeTTS } = require("node-edge-tts");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("Key starts with:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
} else {
    console.error("CRITICAL: GEMINI_API_KEY is missing!");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTest = async (req, res) => {
    try {
        const { level, count, topic } = req.body;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            You are an English teacher creating a listening test for Level ${level} students (Level 1=Elementary 3, Level 10=High School 3).
            Create ${count} multiple-choice listening questions.
            Topic: ${topic || 'General'}.
            
            Output strictly in JSON format with this structure:
            [
                {
                    "id": 1,
                    "dialogue": "Speaker A: ... Speaker B: ...",
                    "question": "...",
                    "options": ["A", "B", "C", "D", "E"],
                    "answer": 1 (index 1-5),
                    "script": "Full script here"
                }
            ]
            Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const questions = JSON.parse(jsonStr);

            res.json({ questions });
        } catch (apiError) {
            console.error("Gemini API Error (Falling back to mock):", apiError.message);
            // Mock Data Fallback
            const mockQuestions = Array.from({ length: count }, (_, i) => ({
                id: i + 1,
                dialogue: `Speaker A: This is a mock dialogue for question ${i + 1}. Speaker B: Yes, we are testing the system.`,
                question: `What is the purpose of this dialogue? (Mock Q${i + 1})`,
                options: ["To test the system", "To buy food", "To study English", "To sleep", "To play games"],
                answer: 1,
                script: `Speaker A: This is a mock dialogue for question ${i + 1}. Speaker B: Yes, we are testing the system.`
            }));
            res.json({ questions: mockQuestions });
        }

    } catch (error) {
        console.error("Gemini Generation Error:", error);
        res.status(500).json({ message: "Failed to generate test questions", error: error.message });
    }
};

const generateAudio = async (req, res) => {
    try {
        const { text, voice } = req.body;
        // Voices: 'en-US-GuyNeural', 'en-US-AriaNeural', etc.
        const selectedVoice = voice || 'en-US-AriaNeural';

        const tts = new EdgeTTS({ voice: selectedVoice });

        // Generate a unique filename
        const filename = `${uuidv4()}.mp3`;
        const publicDir = path.join(__dirname, '../../public/audio');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        const filePath = path.join(publicDir, filename);

        await tts.ttsPromise(text, filePath);

        // Return the public URL
        const audioUrl = `/audio/${filename}`;
        res.json({ audioUrl });

    } catch (error) {
        console.error("TTS Error:", error);
        res.status(500).json({ message: "Failed to generate audio", error: error.message });
    }
};

module.exports = {
    generateTest,
    generateAudio,
    assignTest: async (req, res) => {
        let connection;
        try {
            const { studentId, level, count, topic, questions, audioUrl } = req.body;
            const database = require('../config/database');
            connection = await database.getPool().getConnection();

            // 1. Save the Test
            const resultTest = await connection.execute(
                `INSERT INTO listening_tests (level_num, topic, question_count, questions_json, audio_url)
                 VALUES (:level_num, :topic, :question_count, :questions_json, :audio_url)
                 RETURNING id INTO :id`,
                {
                    level_num: level,
                    topic: topic,
                    question_count: count,
                    questions_json: JSON.stringify(questions),
                    audio_url: audioUrl,
                    id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
                }
            );

            const testId = resultTest.outBinds.id[0];

            // 2. Assign to Student
            await connection.execute(
                `INSERT INTO test_assignments (test_id, student_id, status)
                 VALUES (:test_id, :student_id, 'assigned')`,
                {
                    test_id: testId,
                    student_id: studentId
                }
            );

            await connection.commit();

            res.json({ message: 'Assignment saved', testId });
        } catch (error) {
            console.error("Assignment Error:", error);
            res.status(500).json({ message: "Failed to save assignment" });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    },
    getAssignments: async (req, res) => {
        let connection;
        try {
            const { studentId } = req.params;
            const database = require('../config/database');
            connection = await database.getPool().getConnection();

            const result = await connection.execute(
                `SELECT a.id as assignment_id, a.status, a.assigned_at, a.score,
                        t.id as test_id, t.level_num, t.topic, t.question_count, t.questions_json, t.audio_url
                 FROM test_assignments a
                 JOIN listening_tests t ON a.test_id = t.id
                 WHERE a.student_id = :student_id
                 ORDER BY a.assigned_at DESC`,
                [studentId]
            );

            // Map result to frontend format
            const assignments = result.rows.map(row => {
                // row is an array if outFormat is ARRAY (default), or object if OBJECT
                // database.js sets outFormat = OBJECT usually, let's check.
                // Assuming database.js sets oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

                // If using mockDatabase, it might be different, but we are switching to real DB.
                // Let's assume OBJECT format for safety or handle both? 
                // Standard practice in this project seems to be OBJECT.

                return {
                    id: row.ASSIGNMENT_ID, // Oracle returns uppercase keys by default
                    status: row.STATUS,
                    assignedAt: row.ASSIGNED_AT,
                    score: row.SCORE,
                    testId: row.TEST_ID,
                    level: row.LEVEL_NUM,
                    topic: row.TOPIC,
                    questions: JSON.parse(row.QUESTIONS_JSON), // Parse JSON string back to object
                    audioUrl: row.AUDIO_URL
                };
            });

            res.json(assignments);
        } catch (error) {
            console.error("Get Assignments Error:", error);
            res.status(500).json({ message: "Failed to get assignments" });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
};
