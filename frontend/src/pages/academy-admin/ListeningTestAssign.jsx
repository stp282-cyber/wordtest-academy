import React, { useState, useEffect } from 'react';
import { Users, Headphones, Play, Save, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import client from '../../api/client';

const ListeningTestAssign = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [level, setLevel] = useState(1);
    const [count, setCount] = useState(5);
    const [topic, setTopic] = useState('School Life');
    const [loading, setLoading] = useState(false);
    const [generatedTest, setGeneratedTest] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    useEffect(() => {
        // Fetch students from API
        const fetchStudents = async () => {
            try {
                const response = await client.get('/users/students');
                setStudents(response.data);
            } catch (error) {
                console.error("Failed to fetch students", error);
                // Fallback to localStorage 'students' key if API fails (legacy support)
                const storedStudents = JSON.parse(localStorage.getItem('students') || '[]');
                if (storedStudents.length > 0) {
                    setStudents(storedStudents);
                }
            }
        };
        fetchStudents();
    }, []);

    const handleGenerate = async () => {
        if (!selectedStudent) {
            alert('학생을 선택해주세요.');
            return;
        }

        setLoading(true);
        setGeneratedTest(null);
        setAudioUrl(null);

        try {
            // 1. Generate Text
            const textRes = await client.post('/listening/generate', {
                level,
                count,
                topic
            });
            const questions = textRes.data.questions;

            // 2. Generate Audio (Combine all dialogues)
            // For simplicity, we'll generate audio for the first question or all concatenated
            // Ideally, we generate one audio file for the whole test or per question
            // Let's assume we concat the dialogues for now
            const fullScript = questions.map((q, i) => `Question ${i + 1}. ${q.dialogue}. Question ${i + 1}. ${q.question}`).join(' ... ');

            const audioRes = await client.post('/listening/audio', {
                text: fullScript,
                voice: 'en-US-AriaNeural' // Default voice
            });

            setGeneratedTest(questions);
            setAudioUrl(audioRes.data.audioUrl);

        } catch (error) {
            console.error("Generation failed", error);
            alert('시험 생성에 실패했습니다. API 키를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!generatedTest || !selectedStudent) return;

        try {
            await client.post('/listening/assign', {
                studentId: selectedStudent,
                level,
                count,
                topic,
                questions: generatedTest,
                audioUrl
            });

            alert('시험이 배정되었습니다!');
            setGeneratedTest(null);
            setAudioUrl(null);
        } catch (error) {
            console.error("Assignment failed", error);
            alert('시험 배정에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-black uppercase italic flex items-center">
                    <Headphones className="w-8 h-8 mr-3" /> 듣기 평가 배정 (AI)
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                <Card className="p-6 border-4 border-black shadow-neo-lg bg-white space-y-6">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2">1. 시험 설정</h2>

                    <div>
                        <label className="block font-bold mb-2">학생 선택</label>
                        <select
                            className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                        >
                            <option value="">학생을 선택하세요</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.full_name || s.username} ({s.id})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-bold mb-2">난이도 (Level 1-10)</label>
                        <input
                            type="range" min="1" max="10"
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer border-2 border-black"
                            value={level}
                            onChange={(e) => setLevel(parseInt(e.target.value))}
                        />
                        <div className="text-center font-black text-xl mt-2">Level {level}</div>
                        <p className="text-xs text-slate-500 font-mono text-center">
                            {level <= 2 ? '초등 3-4학년' : level <= 4 ? '초등 5-6학년' : level <= 6 ? '중등 1-2학년' : level <= 8 ? '중3-고1' : '고2-수능'}
                        </p>
                    </div>

                    <div>
                        <label className="block font-bold mb-2">문제 수</label>
                        <select
                            className="w-full p-3 border-2 border-black font-bold"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                        >
                            <option value="5">5문제</option>
                            <option value="10">10문제</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-bold mb-2">주제 (Topic)</label>
                        <input
                            type="text"
                            className="w-full p-3 border-2 border-black font-bold"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="예: School Life, Shopping, Travel..."
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-slate-800 border-white shadow-neo"
                    >
                        {loading ? 'AI가 문제 생성 중...' : '시험 생성하기 (Generate)'}
                    </Button>
                </Card>

                {/* Preview */}
                <Card className="p-6 border-4 border-black shadow-neo-lg bg-yellow-50 space-y-6 relative">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2">2. 미리보기 & 배정</h2>

                    {!generatedTest ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Headphones className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-bold">왼쪽에서 설정을 마치고<br />'생성하기'를 눌러주세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-white p-4 border-2 border-black shadow-sm">
                                <h3 className="font-black text-lg mb-2">Generated Audio</h3>
                                {audioUrl && (
                                    <audio controls className="w-full border-2 border-black">
                                        <source src={`http://localhost:5000${audioUrl}`} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                            </div>

                            <div className="bg-white p-4 border-2 border-black shadow-sm max-h-64 overflow-y-auto">
                                <h3 className="font-black text-lg mb-2">Questions ({generatedTest.length})</h3>
                                {generatedTest.map((q, i) => (
                                    <div key={i} className="mb-4 last:mb-0 border-b border-slate-200 pb-2">
                                        <p className="font-bold text-sm">Q{i + 1}. {q.question}</p>
                                        <p className="text-xs text-slate-500 mt-1 italic">{q.dialogue.substring(0, 50)}...</p>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleAssign}
                                className="w-full bg-green-500 text-white hover:bg-green-600 border-black shadow-neo"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                학생에게 배정하기
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ListeningTestAssign;
