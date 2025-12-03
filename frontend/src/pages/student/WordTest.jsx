import React, { useState, useEffect } from 'react';
import { Volume2, ArrowLeft, ShieldAlert, X, Check, RotateCcw, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { getPreviousReviewWords } from '../../utils/scheduleUtils';

const WordTest = () => {
    const navigate = useNavigate();
    const [lessonData, setLessonData] = useState(null);

    // Test phases: 'study', 'main', 'main_retry', 'wrong_review', 'wrong_retry', 'review', 'review_retry', 'complete'
    const [testPhase, setTestPhase] = useState('study');
    const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);

    // Test data
    const [mainWords, setMainWords] = useState([]);
    const [wrongWords, setWrongWords] = useState([]);
    const [reviewWords, setReviewWords] = useState([]);
    const [reviewWrongWords, setReviewWrongWords] = useState([]);

    // User input
    const [typedAnswer, setTypedAnswer] = useState('');
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [playingWord, setPlayingWord] = useState(null);

    // Results
    const [mainScore, setMainScore] = useState(0);
    const [wrongRetryCount, setWrongRetryCount] = useState(0);
    const [reviewScore, setReviewScore] = useState(0);
    const [reviewRetryCount, setReviewRetryCount] = useState(0);

    // Settings from curriculum
    const [passScore, setPassScore] = useState(70);
    const [testMode, setTestMode] = useState('typing_english');

    // Stable choices for multiple choice test
    const [currentChoices, setCurrentChoices] = useState([]);

    // Scramble Mode State
    const [scrambledChunks, setScrambledChunks] = useState([]);
    const [selectedChunks, setSelectedChunks] = useState([]);

    // Generate choices when entering review phase or changing index
    useEffect(() => {
        if (testPhase === 'review' || testPhase === 'review_retry') {
            const words = testPhase === 'review' ? reviewWords : reviewWrongWords;
            if (words.length > 0 && currentTestIndex < words.length) {
                const currentWord = words[currentTestIndex];
                // generateChoices logic moved here or called here
                // We need to define generateChoices before using it in useEffect, 
                // or move generateChoices definition up, or use a ref.
                // Since generateChoices is defined later, we can't call it here directly if it's not hoisted.
                // However, function declarations are hoisted, but const functions are not.
                // generateChoices is a const function.

                // Let's just implement the logic here directly to avoid hoisting issues
                const choices = [{ text: currentWord.korean, isCorrect: true }];
                // Use a larger pool for distractors (combine review and main words)
                const pool = [...reviewWords, ...mainWords];
                const otherWords = pool.filter(w => w.number !== currentWord.number);

                for (let i = otherWords.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [otherWords[i], otherWords[j]] = [otherWords[j], otherWords[i]];
                }

                const usedKorean = new Set([currentWord.korean]);
                for (const word of otherWords) {
                    if (choices.length >= 5) break;
                    if (!usedKorean.has(word.korean)) {
                        choices.push({ text: word.korean, isCorrect: false });
                        usedKorean.add(word.korean);
                    }
                }

                for (let i = choices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [choices[i], choices[j]] = [choices[j], choices[i]];
                }

                setCurrentChoices(choices);
            }
        }
    }, [testPhase, currentTestIndex, reviewWords, reviewWrongWords, mainWords]);

    // Scramble Logic: Generate chunks when word changes
    useEffect(() => {
        if (testMode === 'scramble' && (testPhase === 'main' || testPhase === 'main_retry' || testPhase === 'wrong_retry' || testPhase === 'review' || testPhase === 'review_retry')) {
            const currentWords = testPhase === 'main' || testPhase === 'main_retry' ? mainWords :
                testPhase === 'wrong_retry' ? wrongWords :
                    testPhase === 'review' || testPhase === 'review_retry' ? reviewWords : [];

            if (currentWords.length > 0 && currentTestIndex < currentWords.length) {
                const word = currentWords[currentTestIndex];
                const english = word.english;

                // Split by spaces to keep words intact, or characters if single word?
                // User request: "scrambled words" -> implies sentence or phrase.
                // If it's a single word, maybe split by characters?
                // Let's assume splitting by words (spaces) first. If no spaces, split by chars.

                let chunks = [];
                if (english.includes(' ')) {
                    chunks = english.split(' ');
                } else {
                    chunks = english.split('');
                }

                // Shuffle chunks
                for (let i = chunks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
                }

                setScrambledChunks(chunks.map((text, idx) => ({ id: idx, text, selected: false })));
                setSelectedChunks([]);
            }
        }
    }, [testMode, testPhase, currentTestIndex, mainWords, wrongWords, reviewWords]);

    useEffect(() => {
        // Load lesson data from localStorage
        const savedLesson = localStorage.getItem('currentLesson');
        if (savedLesson) {
            const parsed = JSON.parse(savedLesson);
            setLessonData(parsed);
            setPassScore(parsed.schedule?.passScore || 70);
            setTestMode(parsed.schedule?.testType || 'typing_english');

            // Shuffle words for main test
            const shuffled = [...parsed.words].sort(() => Math.random() - 0.5);
            setMainWords(shuffled);

            // Load previous words for review based on reviewCycles
            const prevWords = getPreviousReviewWords(parsed.curriculum, new Date(), parsed.curriculum.reviewCycles || 3);
            if (prevWords.length > 0) {
                const shuffledReview = [...prevWords].sort(() => Math.random() - 0.5);
                setReviewWords(shuffledReview);
            }
        } else {
            navigate('/student/learning');
        }

        // Security: Disable right-click and copy/paste
        const handleContextMenu = (e) => e.preventDefault();
        const handleCopyPaste = (e) => e.preventDefault();

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
        };
    }, [navigate]);

    // Save history when test is complete
    useEffect(() => {
        if (testPhase === 'complete' && lessonData) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const historyKey = `learning_history_${user.id}`;
                const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

                // Check if already saved to avoid duplicates (though useEffect should run once if dep is correct)
                // We'll use a simple check
                const newEntry = {
                    curriculumId: lessonData.curriculum.id,
                    date: lessonData.schedule.date, // This is the scheduled date
                    completedAt: new Date().toISOString(),
                    mainScore,
                    reviewScore
                };

                // Remove existing entry for same date/curriculum if any (overwrite)
                const filteredHistory = history.filter(h =>
                    !(h.curriculumId === newEntry.curriculumId && h.date === newEntry.date)
                );

                filteredHistory.push(newEntry);
                localStorage.setItem(historyKey, JSON.stringify(filteredHistory));
            }
        }
    }, [testPhase, lessonData, mainScore, reviewScore]);

    // TTS function
    const playTTS = (text) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;

        setPlayingWord(text);
        utterance.onend = () => setPlayingWord(null);

        window.speechSynthesis.speak(utterance);
    };

    // Normalize answer (remove special characters and spaces)
    const normalizeAnswer = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
    };

    // Check typing answer
    const checkTypingAnswer = (userAnswer, correctAnswer) => {
        return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
    };



    // Handle Scramble Handlers
    const handleChunkSelect = (chunk) => {
        if (chunk.selected) return;

        // Add to selected
        setSelectedChunks(prev => [...prev, chunk]);

        // Mark as selected in scrambled
        setScrambledChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, selected: true } : c));
    };

    const handleChunkDeselect = (chunk) => {
        // Remove from selected
        setSelectedChunks(prev => prev.filter(c => c.id !== chunk.id));

        // Unmark in scrambled
        setScrambledChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, selected: false } : c));
    };

    const handleScrambleSubmit = () => {
        const currentWords = testPhase === 'main' || testPhase === 'main_retry' ? mainWords :
            testPhase === 'wrong_retry' ? wrongWords :
                testPhase === 'review' || testPhase === 'review_retry' ? reviewWords : [];

        const currentWord = currentWords[currentTestIndex];

        // Construct answer from selected chunks
        // If original was split by space, join by space. If by char, join by empty string.
        const separator = currentWord.english.includes(' ') ? ' ' : '';
        const userAnswer = selectedChunks.map(c => c.text).join(separator);

        const isCorrect = checkTypingAnswer(userAnswer, currentWord.english);

        if (testPhase === 'main' || testPhase === 'main_retry') {
            handleMainTestAnswer(isCorrect, currentWord);
        } else if (testPhase === 'wrong_retry') {
            handleWrongRetryAnswer(isCorrect, currentWord);
        } else if (testPhase === 'review') {
            handleReviewAnswer(isCorrect, currentWord);
        } else if (testPhase === 'review_retry') {
            handleReviewRetryAnswer(isCorrect, currentWord);
        }
    };

    // Handle typing submit
    const handleTypingSubmit = () => {
        if (!typedAnswer.trim()) return;

        const currentWords = testPhase === 'main' || testPhase === 'main_retry' ? mainWords :
            testPhase === 'wrong_retry' ? wrongWords : [];

        const currentWord = currentWords[currentTestIndex];
        const isCorrect = checkTypingAnswer(typedAnswer, currentWord.english);

        if (testPhase === 'main' || testPhase === 'main_retry') {
            handleMainTestAnswer(isCorrect, currentWord);
        } else if (testPhase === 'wrong_retry') {
            handleWrongRetryAnswer(isCorrect, currentWord);
        }
    };

    // Handle main test answer
    const handleMainTestAnswer = (isCorrect, word) => {
        if (!isCorrect && !wrongWords.find(w => w.number === word.number)) {
            setWrongWords(prev => [...prev, word]);
        }

        if (currentTestIndex < mainWords.length - 1) {
            setCurrentTestIndex(prev => prev + 1);
            setTypedAnswer('');
        } else {
            // Calculate score
            const correct = mainWords.length - wrongWords.length - (isCorrect ? 0 : 1);
            const score = Math.round((correct / mainWords.length) * 100);
            setMainScore(score);

            // Check if passed
            if (score >= passScore) {
                // Check if there are wrong answers
                const finalWrong = isCorrect ? wrongWords : [...wrongWords, word];
                if (finalWrong.length > 0) {
                    setWrongWords(finalWrong);
                    setTestPhase('wrong_review');
                    setCurrentTestIndex(0);
                } else {
                    // No wrong answers, go to review or complete
                    if (reviewWords.length > 0) {
                        setTestPhase('review');
                        setCurrentTestIndex(0);
                    } else {
                        setTestPhase('complete');
                    }
                }
            } else {
                // Failed, retry main test
                setTestPhase('main_retry');
                setCurrentTestIndex(0);
                setWrongWords([]);
                setTypedAnswer('');
            }
        }
    };

    // Handle wrong retry answer
    const handleWrongRetryAnswer = (isCorrect, word) => {
        if (!isCorrect && !reviewWrongWords.find(w => w.number === word.number)) {
            setReviewWrongWords(prev => [...prev, word]);
        }

        if (currentTestIndex < wrongWords.length - 1) {
            setCurrentTestIndex(prev => prev + 1);
            setTypedAnswer('');
        } else {
            // Check if all correct
            const finalWrong = isCorrect ? reviewWrongWords : [...reviewWrongWords, word];
            if (finalWrong.length === 0) {
                setWrongRetryCount(prev => prev + 1);
                // All correct, go to review or complete
                if (reviewWords.length > 0) {
                    setTestPhase('review');
                    setCurrentTestIndex(0);
                } else {
                    setTestPhase('complete');
                }
            } else {
                // Still have wrong answers, go to study again
                setWrongWords(finalWrong);
                setReviewWrongWords([]);
                setWrongRetryCount(prev => prev + 1);
                setTestPhase('wrong_review');
                setCurrentTestIndex(0);
                setTypedAnswer('');
            }
        }
    };

    // Generate multiple choice options
    const generateChoices = (correctWord, allWords) => {
        const choices = [{ text: correctWord.korean, isCorrect: true }];

        // 배열 복사하여 원본 수정 방지
        const otherWords = [...allWords].filter(w => w.number !== correctWord.number);

        // Fisher-Yates shuffle
        for (let i = otherWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherWords[i], otherWords[j]] = [otherWords[j], otherWords[i]];
        }

        // 중복 없이 4개 추가
        const usedKorean = new Set([correctWord.korean]);
        for (const word of otherWords) {
            if (choices.length >= 5) break;
            if (!usedKorean.has(word.korean)) {
                choices.push({ text: word.korean, isCorrect: false });
                usedKorean.add(word.korean);
            }
        }

        // Fisher-Yates shuffle로 섞기 (한 번만)
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return choices;
    };

    // Handle multiple choice answer
    const handleChoiceAnswer = (choice) => {
        const currentWords = testPhase === 'review' ? reviewWords : reviewWrongWords;
        const currentWord = currentWords[currentTestIndex];
        const isCorrect = choice.isCorrect;

        setSelectedChoice(choice.text);

        setTimeout(() => {
            if (testPhase === 'review') {
                handleReviewAnswer(isCorrect, currentWord);
            } else if (testPhase === 'review_retry') {
                handleReviewRetryAnswer(isCorrect, currentWord);
            }
            setSelectedChoice(null);
        }, 800);
    };

    // Handle review test answer
    const handleReviewAnswer = (isCorrect, word) => {
        if (!isCorrect && !reviewWrongWords.find(w => w.number === word.number)) {
            setReviewWrongWords(prev => [...prev, word]);
        }

        if (currentTestIndex < reviewWords.length - 1) {
            setCurrentTestIndex(prev => prev + 1);
        } else {
            // Calculate score
            const correct = reviewWords.length - reviewWrongWords.length - (isCorrect ? 0 : 1);
            const score = Math.round((correct / reviewWords.length) * 100);
            setReviewScore(score);

            // Check if there are wrong answers
            const finalWrong = isCorrect ? reviewWrongWords : [...reviewWrongWords, word];
            if (finalWrong.length > 0) {
                setReviewWrongWords(finalWrong);
                setTestPhase('review_wrong_study');
                setCurrentTestIndex(0);
            } else {
                setTestPhase('complete');
            }
        }
    };

    // Handle review retry answer
    const handleReviewRetryAnswer = (isCorrect, word) => {
        // Use wrongWords as temporary buffer for failed review words
        if (!isCorrect && !wrongWords.find(w => w.number === word.number)) {
            setWrongWords(prev => [...prev, word]);
        }

        if (currentTestIndex < reviewWrongWords.length - 1) {
            setCurrentTestIndex(prev => prev + 1);
        } else {
            // Check if all correct
            const finalWrong = isCorrect ? wrongWords : [...wrongWords, word];

            if (finalWrong.length === 0) {
                setReviewRetryCount(prev => prev + 1);
                setTestPhase('complete');
                setWrongWords([]); // Clear buffer
            } else {
                // Still have wrong answers, go to study again
                setReviewWrongWords(finalWrong);
                setWrongWords([]); // Clear buffer
                setReviewRetryCount(prev => prev + 1);
                setTestPhase('review_wrong_study');
                setCurrentTestIndex(0);
            }
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTypingSubmit();
        }
    };

    if (!lessonData) return null;

    const { curriculum, schedule, words } = lessonData;

    // Render different phases
    const renderPhaseContent = () => {
        switch (testPhase) {
            case 'study':
                return renderStudyMode();

            case 'main':
            case 'main_retry':
                if (testMode === 'scramble') {
                    return renderScrambleTest(mainWords, '1차 순서 섞기 시험', testPhase === 'main_retry');
                }
                return renderTypingTest(mainWords, '1차 타이핑 시험', testPhase === 'main_retry');

            case 'wrong_review':
                return renderWrongReview();

            case 'wrong_retry':
                if (testMode === 'scramble') {
                    return renderScrambleTest(wrongWords, '오답 순서 섞기 재시험', false);
                }
                return renderTypingTest(wrongWords, '오답 재시험', false);

            case 'review':
                if (testMode === 'scramble') {
                    return renderScrambleTest(reviewWords, '복습 순서 섞기 시험');
                }
                return renderMultipleChoiceTest(reviewWords, '복습 시험 (5지선다)');

            case 'review_wrong_study':
                return renderReviewWrongStudy();

            case 'review_retry':
                if (testMode === 'scramble') {
                    return renderScrambleTest(reviewWrongWords, '복습 오답 순서 섞기 재시험', true);
                }
                return renderMultipleChoiceTest(reviewWrongWords, '복습 오답 재시험');

            case 'complete':
                return renderComplete();

            default:
                return null;
        }
    };

    // Render Scramble Test Mode
    const renderScrambleTest = (words, title, isRetry = false) => {
        if (words.length === 0) return null;
        const currentWord = words[currentTestIndex];
        const progress = Math.round(((currentTestIndex) / words.length) * 100);

        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center justify-start pt-12">
                <div className="w-full max-w-4xl space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-black uppercase italic">{title}</h2>
                        <div className="flex items-center gap-4">
                            <div className="bg-white px-4 py-2 border-2 border-black shadow-neo-sm font-bold">
                                {currentTestIndex + 1} / {words.length}
                            </div>
                            <div className="w-32 h-4 bg-white border-2 border-black p-0.5">
                                <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>

                    <Card className="border-4 border-black shadow-neo-lg bg-white p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center space-y-12">
                        {/* Korean Meaning */}
                        <div className="text-center space-y-4">
                            <span className="inline-block bg-yellow-300 px-4 py-1 border-2 border-black font-black text-sm uppercase transform -rotate-2">
                                Meaning
                            </span>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-800 break-keep leading-tight">
                                {currentWord.korean}
                            </h3>
                        </div>

                        {/* Answer Area (Selected Chunks) */}
                        <div className="w-full min-h-[80px] border-b-4 border-black border-dashed p-4 flex flex-wrap justify-center gap-3 items-center bg-slate-50">
                            {selectedChunks.length === 0 && (
                                <span className="text-slate-400 font-bold">단어 조각을 선택하여 문장을 완성하세요</span>
                            )}
                            {selectedChunks.map((chunk) => (
                                <button
                                    key={`selected-${chunk.id}`}
                                    onClick={() => handleChunkDeselect(chunk)}
                                    className="bg-black text-white border-2 border-black px-4 py-2 text-xl font-bold shadow-neo-sm hover:bg-red-500 hover:border-red-500 transition-colors animate-in zoom-in duration-200"
                                >
                                    {chunk.text}
                                </button>
                            ))}
                        </div>

                        {/* Choice Area (Scrambled Chunks) */}
                        <div className="flex flex-wrap justify-center gap-4">
                            {scrambledChunks.map((chunk) => (
                                <button
                                    key={`scrambled-${chunk.id}`}
                                    onClick={() => handleChunkSelect(chunk)}
                                    disabled={chunk.selected}
                                    className={`
                                    px-6 py-3 text-xl font-bold border-4 border-black shadow-neo transition-all
                                    ${chunk.selected
                                            ? 'opacity-0 scale-0 pointer-events-none'
                                            : 'bg-white hover:bg-yellow-100 hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-0 active:shadow-neo'}
                                `}
                                >
                                    {chunk.text}
                                </button>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8">
                            <Button
                                onClick={handleScrambleSubmit}
                                disabled={selectedChunks.length === 0}
                                className="bg-green-400 text-black hover:bg-green-500 border-black shadow-neo hover:shadow-neo-lg px-12 py-4 text-xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                제출하기 (Submit)
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    // Render study mode (flashcards)
    const renderStudyMode = () => {
        if (mainWords.length === 0) return null;

        const getFontSize = (text) => {
            if (text.length > 15) return 'text-2xl';
            if (text.length > 10) return 'text-3xl';
            return 'text-4xl';
        };

        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8 select-none">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-700">
                        <div>
                            <Button
                                onClick={() => navigate('/student/learning')}
                                variant="ghost"
                                className="mb-2 pl-0 hover:bg-transparent hover:text-slate-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Schedule
                            </Button>
                            <h1 className="text-5xl font-black text-black uppercase italic tracking-tight mb-4 drop-shadow-sm">
                                Word Study
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-black text-white px-4 py-1.5 font-bold text-sm transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)]">
                                    {lessonData.schedule.textbook}
                                </span>
                                <span className="bg-yellow-300 border-2 border-black px-4 py-1.5 font-bold text-sm shadow-neo-sm transform rotate-1">
                                    {lessonData.schedule.unitName || `${lessonData.schedule.major} - ${lessonData.schedule.minor}`}
                                </span>
                                <span className="bg-blue-500 text-white border-2 border-black px-4 py-1.5 font-bold text-sm shadow-neo-sm transform -rotate-1">
                                    총 {mainWords.length}단어
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 self-end md:self-auto">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-100 border-2 border-red-500 text-red-600 font-bold text-xs rounded-full animate-pulse">
                                <ShieldAlert className="w-4 h-4" />
                                Anti-Cheat Active
                            </div>
                            <Button
                                onClick={() => {
                                    setTestPhase('main');
                                    setCurrentTestIndex(0);
                                    setTypedAnswer('');
                                }}
                                className="bg-blue-600 text-white border-black hover:bg-blue-700 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform transition-all shadow-neo-lg px-8 py-4 text-xl font-black"
                            >
                                시험 시작하기
                            </Button>
                        </div>
                    </div>

                    {/* Word Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {mainWords.map((word, index) => (
                            <div
                                key={index}
                                onClick={() => playTTS(word.english)}
                                className={`
                                    relative group cursor-pointer
                                    bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                                    hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-2
                                    transition-all duration-300 overflow-hidden
                                    animate-in fade-in slide-in-from-bottom-4
                                    ${playingWord === word.english ? 'bg-gradient-to-br from-yellow-50 to-orange-50 ring-4 ring-yellow-400 scale-105 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]' : ''}
                                `}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Number Badge */}
                                <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 font-black text-sm border-b-2 border-r-2 border-black z-10">
                                    #{index + 1}
                                </div>

                                {/* TTS Icon */}
                                <div className={`absolute top-3 right-3 p-3 rounded-full border-3 border-black transition-all duration-300 z-20 ${playingWord === word.english
                                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 opacity-100 scale-110 rotate-12'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                                    }`}>
                                    <Volume2 className={`w-6 h-6 transition-all duration-300 ${playingWord === word.english ? 'text-white animate-bounce' : 'text-black group-hover:text-blue-600'}`} />
                                </div>

                                <div className="p-8 pt-16 text-center space-y-4">
                                    {/* English Word */}
                                    <div className="relative">
                                        <h3 className={`${getFontSize(word.english)} font-black break-words leading-tight transition-all duration-300 ${playingWord === word.english
                                            ? 'text-blue-600 scale-105'
                                            : 'text-black group-hover:text-blue-600 group-hover:scale-105'
                                            }`}>
                                            {word.english}
                                        </h3>
                                        {/* Decorative underline */}
                                        <div className={`h-2 w-20 mx-auto mt-3 transform -rotate-2 transition-all duration-300 ${playingWord === word.english
                                            ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 scale-125 rotate-3'
                                            : 'bg-yellow-300 group-hover:scale-125 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400'
                                            }`} />
                                    </div>

                                    {/* Korean Meaning */}
                                    <p className={`text-2xl font-bold transition-all duration-300 ${playingWord === word.english
                                        ? 'text-purple-600 scale-105'
                                        : 'text-slate-600 group-hover:text-black group-hover:scale-105'
                                        }`}>
                                        {word.korean}
                                    </p>
                                </div>

                                {/* Bottom Strip - Animated */}
                                <div className={`h-3 w-full transition-all duration-500 ${playingWord === word.english
                                    ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse'
                                    : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 origin-left'
                                    }`} />
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center py-8 space-y-4">
                        <Button
                            onClick={() => {
                                setTestPhase('main');
                                setCurrentTestIndex(0);
                                setTypedAnswer('');
                            }}
                            className="bg-blue-600 text-white border-black hover:bg-blue-700 px-12 py-4 text-xl font-black shadow-neo-lg hover:shadow-neo-xl transition-all animate-pulse hover:animate-none"
                        >
                            시험 시작하기
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // Render typing test
    const renderTypingTest = (testWords, title, isRetry) => {
        if (testWords.length === 0) return null;
        const currentWord = testWords[currentTestIndex];

        return (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-white border-4 border-black shadow-neo-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black italic uppercase">{title}</h2>
                            {isRetry && <span className="bg-red-500 text-white px-3 py-1 font-bold text-sm">재시험 (통과점수: {passScore}점)</span>}
                            <span className="bg-yellow-300 text-black px-2 py-0.5 font-bold text-sm border border-white">
                                {currentTestIndex + 1} / {testWords.length}
                            </span>
                        </div>
                        <button onClick={() => navigate('/student/learning')} className="hover:text-red-400 transition-colors">
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center">
                        <div className="w-full max-w-xl space-y-8 text-center">
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">한글 뜻</p>
                                <h3 className="text-5xl md:text-6xl font-black text-black">
                                    {currentWord.korean}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">영어 단어 입력</p>
                                <input
                                    type="text"
                                    value={typedAnswer}
                                    onChange={(e) => setTypedAnswer(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type the English word..."
                                    autoFocus
                                    className="w-full text-3xl font-bold text-center p-4 border-4 border-black focus:outline-none focus:shadow-neo"
                                />
                                <Button
                                    onClick={handleTypingSubmit}
                                    disabled={!typedAnswer.trim()}
                                    className="w-full bg-blue-600 text-white border-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    제출
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-100">
                        <div
                            className="h-full bg-yellow-400 transition-all duration-300"
                            style={{ width: `${((currentTestIndex) / testWords.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Render wrong review (flashcard mode)
    const renderWrongReview = () => {
        const getFontSize = (text) => {
            if (text.length > 15) return 'text-2xl';
            if (text.length > 10) return 'text-3xl';
            return 'text-4xl';
        };

        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8 select-none">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-700">
                        <div>
                            <Button
                                onClick={() => navigate('/student/learning')}
                                variant="ghost"
                                className="mb-2 pl-0 hover:bg-transparent hover:text-slate-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Schedule
                            </Button>
                            <h1 className="text-5xl font-black text-black uppercase italic tracking-tight mb-4 drop-shadow-sm">
                                Wrong Review
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-red-500 text-white px-4 py-1.5 font-bold text-sm transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)]">
                                    오답 복습
                                </span>
                                <span className="bg-yellow-300 border-2 border-black px-4 py-1.5 font-bold text-sm shadow-neo-sm transform rotate-1">
                                    총 {wrongWords.length}단어
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 self-end md:self-auto">
                            <Button
                                onClick={() => {
                                    setTestPhase('wrong_retry');
                                    setCurrentTestIndex(0);
                                    setTypedAnswer('');
                                    setReviewWrongWords([]);
                                }}
                                className="bg-red-600 text-white border-black hover:bg-red-700 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform transition-all shadow-neo-lg px-8 py-4 text-xl font-black"
                            >
                                재시험 시작하기
                            </Button>
                        </div>
                    </div>

                    {/* Wrong Words Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {wrongWords.map((word, index) => (
                            <div
                                key={index}
                                onClick={() => playTTS(word.english)}
                                className={`
                                    relative group cursor-pointer
                                    bg-white border-4 border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]
                                    hover:shadow-[16px_16px_0px_0px_rgba(239,68,68,1)] hover:-translate-y-2 hover:-translate-x-2
                                    transition-all duration-300 overflow-hidden
                                    animate-in fade-in slide-in-from-bottom-4
                                    ${playingWord === word.english ? 'bg-gradient-to-br from-red-50 to-orange-50 ring-4 ring-red-400 scale-105 shadow-[20px_20px_0px_0px_rgba(239,68,68,1)]' : ''}
                                `}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Number Badge */}
                                <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 font-black text-sm border-b-2 border-r-2 border-black z-10">
                                    #{index + 1}
                                </div>

                                {/* TTS Icon */}
                                <div className={`absolute top-3 right-3 p-3 rounded-full border-3 border-black transition-all duration-300 z-20 ${playingWord === word.english
                                    ? 'bg-gradient-to-br from-red-500 to-orange-600 opacity-100 scale-110 rotate-12'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                                    }`}>
                                    <Volume2 className={`w-6 h-6 transition-all duration-300 ${playingWord === word.english ? 'text-white animate-bounce' : 'text-black group-hover:text-red-600'}`} />
                                </div>

                                <div className="p-8 pt-16 text-center space-y-4">
                                    {/* English Word */}
                                    <div className="relative">
                                        <h3 className={`${getFontSize(word.english)} font-black break-words leading-tight transition-all duration-300 ${playingWord === word.english
                                            ? 'text-red-600 scale-105'
                                            : 'text-black group-hover:text-red-600 group-hover:scale-105'
                                            }`}>
                                            {word.english}
                                        </h3>
                                        {/* Decorative underline */}
                                        <div className={`h-2 w-20 mx-auto mt-3 transform -rotate-2 transition-all duration-300 ${playingWord === word.english
                                            ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 scale-125 rotate-3'
                                            : 'bg-red-300 group-hover:scale-125 group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-orange-400'
                                            }`} />
                                    </div>

                                    {/* Korean Meaning */}
                                    <p className={`text-2xl font-bold transition-all duration-300 ${playingWord === word.english
                                        ? 'text-orange-600 scale-105'
                                        : 'text-slate-600 group-hover:text-black group-hover:scale-105'
                                        }`}>
                                        {word.korean}
                                    </p>
                                </div>

                                {/* Bottom Strip - Animated */}
                                <div className={`h-3 w-full transition-all duration-500 ${playingWord === word.english
                                    ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-pulse'
                                    : 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 origin-left'
                                    }`} />
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center py-8 space-y-4">
                        <Button
                            onClick={() => {
                                setTestPhase('wrong_retry');
                                setCurrentTestIndex(0);
                                setTypedAnswer('');
                                setReviewWrongWords([]);
                            }}
                            className="bg-red-600 text-white border-black hover:bg-red-700 px-12 py-4 text-xl font-black shadow-neo-lg hover:shadow-neo-xl transition-all animate-pulse hover:animate-none"
                        >
                            재시험 시작하기
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // Render review wrong study mode
    const renderReviewWrongStudy = () => {
        if (reviewWrongWords.length === 0) return null;

        const getFontSize = (text) => {
            if (text.length > 15) return 'text-2xl';
            if (text.length > 10) return 'text-3xl';
            return 'text-4xl';
        };

        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8 select-none">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-700">
                        <div>
                            <Button
                                onClick={() => navigate('/student/learning')}
                                variant="ghost"
                                className="mb-2 pl-0 hover:bg-transparent hover:text-slate-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Schedule
                            </Button>
                            <h1 className="text-5xl font-black text-black uppercase italic tracking-tight mb-4 drop-shadow-sm">
                                Review Wrong Study
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-red-500 text-white px-4 py-1.5 font-bold text-sm transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)]">
                                    복습 오답 학습
                                </span>
                                <span className="bg-yellow-300 border-2 border-black px-4 py-1.5 font-bold text-sm shadow-neo-sm transform rotate-1">
                                    총 {reviewWrongWords.length}단어
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 self-end md:self-auto">
                            <Button
                                onClick={() => {
                                    setTestPhase('review_retry');
                                    setCurrentTestIndex(0);
                                }}
                                className="bg-red-600 text-white border-black hover:bg-red-700 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform transition-all shadow-neo-lg px-8 py-4 text-xl font-black"
                            >
                                복습 재시험 시작하기
                            </Button>
                        </div>
                    </div>

                    {/* Wrong Words Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviewWrongWords.map((word, index) => (
                            <div
                                key={index}
                                onClick={() => playTTS(word.english)}
                                className={`
                                    relative group cursor-pointer
                                    bg-white border-4 border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]
                                    hover:shadow-[16px_16px_0px_0px_rgba(239,68,68,1)] hover:-translate-y-2 hover:-translate-x-2
                                    transition-all duration-300 overflow-hidden
                                    animate-in fade-in slide-in-from-bottom-4
                                    ${playingWord === word.english ? 'bg-gradient-to-br from-red-50 to-orange-50 ring-4 ring-red-400 scale-105 shadow-[20px_20px_0px_0px_rgba(239,68,68,1)]' : ''}
                                `}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Number Badge */}
                                <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 font-black text-sm border-b-2 border-r-2 border-black z-10">
                                    #{index + 1}
                                </div>

                                {/* TTS Icon */}
                                <div className={`absolute top-3 right-3 p-3 rounded-full border-3 border-black transition-all duration-300 z-20 ${playingWord === word.english
                                    ? 'bg-gradient-to-br from-red-500 to-orange-600 opacity-100 scale-110 rotate-12'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                                    }`}>
                                    <Volume2 className={`w-6 h-6 transition-all duration-300 ${playingWord === word.english ? 'text-white animate-bounce' : 'text-black group-hover:text-red-600'}`} />
                                </div>

                                <div className="p-8 pt-16 text-center space-y-4">
                                    {/* English Word */}
                                    <div className="relative">
                                        <h3 className={`${getFontSize(word.english)} font-black break-words leading-tight transition-all duration-300 ${playingWord === word.english
                                            ? 'text-red-600 scale-105'
                                            : 'text-black group-hover:text-red-600 group-hover:scale-105'
                                            }`}>
                                            {word.english}
                                        </h3>
                                        {/* Decorative underline */}
                                        <div className={`h-2 w-20 mx-auto mt-3 transform -rotate-2 transition-all duration-300 ${playingWord === word.english
                                            ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 scale-125 rotate-3'
                                            : 'bg-red-300 group-hover:scale-125 group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-orange-400'
                                            }`} />
                                    </div>

                                    {/* Korean Meaning */}
                                    <p className={`text-2xl font-bold transition-all duration-300 ${playingWord === word.english
                                        ? 'text-orange-600 scale-105'
                                        : 'text-slate-600 group-hover:text-black group-hover:scale-105'
                                        }`}>
                                        {word.korean}
                                    </p>
                                </div>

                                {/* Bottom Strip - Animated */}
                                <div className={`h-3 w-full transition-all duration-500 ${playingWord === word.english
                                    ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-pulse'
                                    : 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 origin-left'
                                    }`} />
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center py-8 space-y-4">
                        <Button
                            onClick={() => {
                                setTestPhase('review_retry');
                                setCurrentTestIndex(0);
                            }}
                            className="bg-red-600 text-white border-black hover:bg-red-700 px-12 py-4 text-xl font-black shadow-neo-lg hover:shadow-neo-xl transition-all animate-pulse hover:animate-none"
                        >
                            재시험 시작하기
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // Render multiple choice test
    const renderMultipleChoiceTest = (testWords, title) => {
        if (testWords.length === 0) return null;
        const currentWord = testWords[currentTestIndex];
        // Use pre-generated choices from state
        const choices = currentChoices;

        return (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-start justify-center p-4 pt-20 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-300 mb-20">
                    {/* Header */}
                    <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black italic uppercase tracking-wider text-yellow-400">{title}</h2>
                            <span className="bg-white text-black px-3 py-0.5 font-black text-sm border-2 border-black transform -rotate-2">
                                {currentTestIndex + 1} / {testWords.length}
                            </span>
                        </div>
                        <button onClick={() => navigate('/student/learning')} className="hover:text-red-400 transition-colors hover:scale-110 transform duration-200">
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col items-center justify-center bg-yellow-50">
                        <div className="w-full space-y-6">
                            {/* Question */}
                            <div className="text-center space-y-2 py-4">
                                <p className="text-xs font-black text-black uppercase tracking-[0.3em] bg-yellow-300 inline-block px-2 py-1 border-2 border-black transform rotate-2">Question</p>
                                <h3 className="text-5xl font-black text-black drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                                    {currentWord.english}
                                </h3>
                            </div>

                            {/* Choices */}
                            <div className="grid gap-3">
                                {choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleChoiceAnswer(choice)}
                                        disabled={selectedChoice !== null}
                                        className={`
                                            w-full p-4 border-4 text-lg font-black transition-all duration-200 relative overflow-hidden group
                                            ${selectedChoice === choice.text
                                                ? choice.isCorrect
                                                    ? 'bg-green-500 border-black text-white scale-[1.02] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10'
                                                    : 'bg-red-500 border-black text-white scale-95 opacity-50'
                                                : 'bg-white border-black hover:bg-blue-400 hover:text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1'
                                            } 
                                            disabled:cursor-not-allowed
                                        `}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`
                                                flex items-center justify-center w-8 h-8 border-2 border-black font-black text-base
                                                ${selectedChoice === choice.text
                                                    ? 'bg-black text-white'
                                                    : 'bg-yellow-300 text-black group-hover:bg-white group-hover:text-black'
                                                }
                                            `}>
                                                {index + 1}
                                            </span>
                                            <span className="flex-1 text-left">{choice.text}</span>
                                            {selectedChoice === choice.text && (
                                                choice.isCorrect
                                                    ? <Check className="w-6 h-6 animate-bounce" />
                                                    : <X className="w-6 h-6 animate-pulse" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 bg-white border-t-4 border-black">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                            style={{ width: `${((currentTestIndex) / testWords.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Render complete screen
    const renderComplete = () => {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 animate-in fade-in zoom-in duration-500 overflow-y-auto max-h-[90vh]">
                    <div className="text-center space-y-10">
                        {/* Title Section */}
                        <div className="space-y-4 relative">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-400 border-4 border-black animate-spin-slow" />
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-blue-400 border-4 border-black animate-bounce" />

                            <h2 className="text-6xl md:text-7xl font-black text-black uppercase italic tracking-tighter animate-in slide-in-from-bottom-8 duration-700 drop-shadow-[4px_4px_0px_rgba(255,0,0,1)]">
                                Mission<br />Complete!
                            </h2>
                            <div className="inline-block bg-black text-white px-6 py-2 transform -rotate-2 hover:rotate-2 transition-transform duration-300">
                                <p className="text-xl md:text-2xl font-black animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                    모든 학습 단계를 정복했습니다
                                </p>
                            </div>
                        </div>

                        {/* Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            <div className="bg-blue-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 group">
                                <div className="text-sm font-black text-black uppercase tracking-widest mb-2 bg-blue-300 inline-block px-2 border-2 border-black">1차 시험</div>
                                <div className="text-5xl font-black text-black group-hover:scale-110 transition-transform duration-300">{mainScore}점</div>
                            </div>
                            {reviewWords.length > 0 && (
                                <div className="bg-purple-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="text-sm font-black text-black uppercase tracking-widest mb-2 bg-purple-300 inline-block px-2 border-2 border-black">복습 시험</div>
                                    <div className="text-5xl font-black text-black group-hover:scale-110 transition-transform duration-300">{reviewScore}점</div>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center pt-4 animate-in fade-in duration-1000 delay-500">
                            <Button
                                onClick={() => navigate('/student/learning')}
                                className="bg-red-500 text-white border-4 border-black hover:bg-red-600 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-10 py-5 text-xl font-black transition-all shadow-neo-lg uppercase tracking-wider"
                            >
                                학습 일정으로 돌아가기
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 select-none">
            <div className="max-w-5xl mx-auto">
                {/* Test Modal */}
                {testPhase !== 'idle' && renderPhaseContent()}
            </div>
        </div>
    );
};

export default WordTest;

