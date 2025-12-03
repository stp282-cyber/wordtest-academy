import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Pause, CheckCircle, RotateCcw, Edit3 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ListeningTestTake = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [currentTest, setCurrentTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
    const [isPlaying, setIsPlaying] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [retryMode, setRetryMode] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const fetchAssignments = async () => {
            try {
                const response = await client.get(`/listening/assignments/${user.id}`);
                setAssignments(response.data.reverse());
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            }
        };
        fetchAssignments();
    }, [user]);

    const startTest = (test) => {
        setCurrentTest(test);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setShowResult(false);
        setRetryMode(false);
        setReviewMode(false);
    };

    const handlePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAnswer = (optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentTest.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Finish
            setShowResult(true);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        currentTest.questions.forEach((q, i) => {
            if (answers[i] === q.answer) correct++;
        });
        return Math.round((correct / currentTest.questions.length) * 100);
    };

    const getWrongQuestions = () => {
        return currentTest.questions.filter((q, i) => answers[i] !== q.answer);
    };

    const handleRetry = () => {
        const wrongIndices = currentTest.questions.map((q, i) => answers[i] !== q.answer ? i : -1).filter(i => i !== -1);
        if (wrongIndices.length === 0) return;

        alert(`틀린 문제 ${wrongIndices.length}개를 다시 풀어보세요.`);
        setShowResult(false);
        setRetryMode(true);
        setAnswers(prev => {
            const newAnswers = { ...prev };
            wrongIndices.forEach(i => delete newAnswers[i]);
            return newAnswers;
        });
        setCurrentQuestionIndex(wrongIndices[0]);
    };

    if (!currentTest) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-black text-black uppercase italic flex items-center">
                    <Headphones className="w-8 h-8 mr-3" /> 듣기 평가
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(test => (
                        <Card key={test.id} className="p-6 border-4 border-black shadow-neo hover:shadow-neo-lg transition-all cursor-pointer bg-white" onClick={() => startTest(test)}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">Level {test.level}</span>
                                <span className="text-xs font-mono font-bold text-slate-500">{new Date(test.assignedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-black text-xl mb-2">{test.topic}</h3>
                            <p className="text-sm font-bold text-slate-600">{test.questions.length} 문제</p>
                        </Card>
                    ))}
                    {assignments.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 font-bold">
                            배정된 듣기 평가가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (reviewMode) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-black uppercase italic">복습 및 받아쓰기</h1>
                    <Button onClick={() => setCurrentTest(null)} variant="secondary" className="bg-slate-200 border-black">나가기</Button>
                </div>
                {currentTest.questions.map((q, i) => (
                    <Card key={i} className="p-6 border-4 border-black shadow-neo bg-white">
                        <h3 className="font-black text-lg mb-2">Q{i + 1}. 대본 (Script)</h3>
                        <div className="bg-slate-100 p-4 rounded border-2 border-slate-300 font-mono text-sm mb-4 whitespace-pre-wrap">
                            {q.dialogue}
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold">받아쓰기 연습:</p>
                            <textarea
                                className="w-full p-3 border-2 border-black rounded font-mono"
                                placeholder="여기에 대본을 입력하며 연습하세요..."
                                rows="3"
                            />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (showResult) {
        const score = calculateScore();
        const wrongCount = getWrongQuestions().length;

        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
                <h1 className="text-4xl font-black uppercase italic">시험 결과</h1>
                <div className="text-6xl font-black text-primary">{score}점</div>
                <p className="text-xl font-bold text-slate-600">
                    {wrongCount === 0 ? '만점입니다! 🎉' : `${wrongCount}문제 틀렸습니다.`}
                </p>

                <div className="flex justify-center gap-4">
                    {wrongCount > 0 ? (
                        <Button onClick={handleRetry} className="bg-red-500 text-white border-black shadow-neo hover:bg-red-600">
                            <RotateCcw className="w-5 h-5 mr-2" /> 오답 다시 풀기
                        </Button>
                    ) : (
                        <Button onClick={() => setReviewMode(true)} className="bg-green-500 text-white border-black shadow-neo hover:bg-green-600">
                            <Edit3 className="w-5 h-5 mr-2" /> 받아쓰기 복습 시작
                        </Button>
                    )}
                    <Button onClick={() => setCurrentTest(null)} variant="secondary" className="border-black shadow-neo">
                        목록으로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    const question = currentTest.questions[currentQuestionIndex];

    const handleTimeUpdate = () => {
        if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            if (duration > 0) {
                setProgress((current / duration) * 100);
            }
        }
    };

    const handleSeek = (e) => {
        if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const newTime = (x / width) * audioRef.current.duration;
            if (Number.isFinite(newTime)) {
                audioRef.current.currentTime = newTime;
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase italic">문제 {currentQuestionIndex + 1} / {currentTest.questions.length}</h2>
                <Button onClick={() => setCurrentTest(null)} size="sm" variant="secondary" className="bg-slate-200 border-black">종료</Button>
            </div>

            {/* Audio Player */}
            <Card className="p-6 border-4 border-black shadow-neo bg-yellow-300 flex items-center justify-center gap-4">
                <Button
                    onClick={handlePlay}
                    className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-black bg-white hover:bg-slate-100"
                >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                <div className="flex-1">
                    <div className="h-4 bg-white border-2 border-black rounded-full overflow-hidden relative cursor-pointer"
                        onClick={handleSeek}>
                        <div
                            className="h-full bg-black transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <audio
                    ref={audioRef}
                    src={`http://localhost:5000${currentTest.audioUrl}`}
                    onEnded={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    className="hidden"
                />
            </Card>

            {/* Question */}
            <Card className="p-8 border-4 border-black shadow-neo-lg bg-white space-y-6">
                <h3 className="text-xl font-bold">{question.question}</h3>
                <div className="space-y-3">
                    {question.options.map((opt, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleAnswer(idx + 1)}
                            className={`
                                p-4 border-2 border-black cursor-pointer transition-all font-bold flex items-center
                                ${answers[currentQuestionIndex] === idx + 1
                                    ? 'bg-black text-white transform -translate-y-1 shadow-neo'
                                    : 'bg-white hover:bg-slate-50'}
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 font-black
                                ${answers[currentQuestionIndex] === idx + 1 ? 'bg-white text-black' : 'bg-slate-100'}
                            `}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            {opt}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    variant="secondary"
                    className="border-2 border-black"
                >
                    이전
                </Button>
                <Button
                    onClick={handleNext}
                    className="bg-black text-white border-white shadow-neo hover:bg-slate-800"
                >
                    {currentQuestionIndex === currentTest.questions.length - 1 ? '시험 종료' : '다음 문제'}
                </Button>
            </div>
        </div>
    );
};

export default ListeningTestTake;
