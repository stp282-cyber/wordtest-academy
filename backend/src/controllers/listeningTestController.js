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
        try {
            const assignment = {
                id: Date.now(),
                ...req.body,
                assignedAt: new Date().toISOString(),
                status: 'assigned'
            };

            const dataDir = path.join(__dirname, '../../data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            const filePath = path.join(dataDir, 'assignments.json');

            let assignments = [];
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                if (fileContent) assignments = JSON.parse(fileContent);
            }

            assignments.push(assignment);
            fs.writeFileSync(filePath, JSON.stringify(assignments, null, 2));

            res.json({ message: 'Assignment saved', assignment });
        } catch (error) {
            console.error("Assignment Error:", error);
            res.status(500).json({ message: "Failed to save assignment" });
        }
    },
    getAssignments: async (req, res) => {
        try {
            const { studentId } = req.params;
            const dataDir = path.join(__dirname, '../../data');
            const filePath = path.join(dataDir, 'assignments.json');

            let assignments = [];
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                if (fileContent) assignments = JSON.parse(fileContent);
            }

            // Filter by studentId
            const studentAssignments = assignments.filter(a => String(a.studentId) === String(studentId));

            res.json(studentAssignments);
        } catch (error) {
            console.error("Get Assignments Error:", error);
            res.status(500).json({ message: "Failed to get assignments" });
        }
    }
};
