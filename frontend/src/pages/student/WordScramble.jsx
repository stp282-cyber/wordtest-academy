import React, { useState, useEffect, useRef } from 'react';
import { Timer, RefreshCw, Trophy, ArrowLeft, Lightbulb, Puzzle, Star, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { saveScore } from '../../services/gameScoreService';

const WORD_DATA = [
    { e: 'apple', k: '사과' }, { e: 'banana', k: '바나나' }, { e: 'cat', k: '고양이' },
    { e: 'dog', k: '개' }, { e: 'egg', k: '달걀' }, { e: 'fish', k: '물고기' },
    { e: 'girl', k: '소녀' }, { e: 'hat', k: '모자' }, { e: 'ice', k: '얼음' },
    { e: 'jump', k: '점프하다' }, { e: 'kite', k: '연' }, { e: 'lion', k: '사자' },
    { e: 'mom', k: '엄마' }, { e: 'nose', k: '코' }, { e: 'orange', k: '오렌지' },
    { e: 'pen', k: '펜' }, { e: 'queen', k: '여왕' }, { e: 'red', k: '빨간색' },
    { e: 'sun', k: '태양' }, { e: 'tree', k: '나무' }, { e: 'up', k: '위로' },
    { e: 'van', k: '밴' }, { e: 'water', k: '물' }, { e: 'box', k: '상자' },
    { e: 'yellow', k: '노란색' }, { e: 'zoo', k: '동물원' }, { e: 'book', k: '책' },
    { e: 'desk', k: '책상' }, { e: 'school', k: '학교' }, { e: 'friend', k: '친구' }
];

const WordScramble = () => {
    const [currentWord, setCurrentWord] = useState(null);
    const [scrambled, setScrambled] = useState('');
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [streak, setStreak] = useState(0);
    const [hintUsed, setHintUsed] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null

    const inputRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isPlaying) {
            endGame();
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, timeLeft]);

    useEffect(() => {
        if (isPlaying && !gameOver && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 10);
        }
    }, [isPlaying, gameOver]);

    const scrambleWord = (word) => {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        // Ensure it's not the same as original
        if (arr.join('') === word && word.length > 1) return scrambleWord(word);
        return arr.join('');
    };

    const nextWord = () => {
        const randomPair = WORD_DATA[Math.floor(Math.random() * WORD_DATA.length)];
        setCurrentWord(randomPair);
        setScrambled(scrambleWord(randomPair.e));
        setInput('');
        setHintUsed(false);
        setFeedback(null);
    };

    const startGame = () => {

        if (input.toLowerCase().trim() === currentWord.e.toLowerCase()) {
            // Correct
            const points = 100 + (streak * 10) - (hintUsed ? 50 : 0);
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            setFeedback('correct');
            setTimeLeft(prev => Math.min(prev + 3, 60)); // Bonus time

            setTimeout(() => {
                nextWord();
            }, 500);
        } else {
            // Wrong
            setStreak(0);
            setFeedback('wrong');
            setInput('');
            // Shake effect or visual cue could be added here
        }
    };

    const useHint = () => {
        if (!isPlaying || hintUsed || !currentWord) return;
        setHintUsed(true);
        // Reveal first letter and length
        setInput(currentWord.e[0]);
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <Link to="/student/games">
                    <Button variant="secondary" className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Timer className={`w-5 h-5 mr-2 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-black'}`} />
                        <span className={`font-black text-xl font-mono ${timeLeft < 10 ? 'text-red-500' : 'text-black'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                        <span className="font-black text-xl font-mono">Streak: {streak}</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="font-black text-xl font-mono">{score}</span>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <Card className="flex-1 border-4 border-black shadow-neo-lg bg-indigo-50 relative overflow-hidden p-0 flex flex-col">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {!isPlaying && !gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md">
                            <div className="w-20 h-20 bg-indigo-400 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-4 transform -rotate-12">
                                <Shuffle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-4xl font-black uppercase">Word Scramble</h2>
                            <p className="text-lg text-slate-600 font-bold">
                                Unscramble the letters to find the correct English word!
                            </p>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 shadow-neo hover:shadow-neo-lg">
                                Start Puzzle
                            </Button>
                        </div>
                    </div>
                ) : gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/90 z-20 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md animate-bounce-in">
                            <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                            <h2 className="text-5xl font-black uppercase">Time's Up!</h2>
                            <div className="space-y-2">
                                <p className="text-xl font-bold text-slate-500">Final Score</p>
                                <p className="text-6xl font-black font-mono">{score}</p>
                            </div>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 mt-4">
                                <RefreshCw className="w-6 h-6 mr-2" /> Play Again
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* Active Game Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
                    {currentWord && (
                        <div className="w-full max-w-2xl space-y-12 text-center">
                            {/* Korean Hint */}
                            <div className="inline-block bg-white border-4 border-black px-8 py-3 shadow-neo transform -rotate-2">
                                <h3 className="text-3xl font-black text-slate-800">{currentWord.k}</h3>
                            </div>

                            {/* Scrambled Letters */}
                            <div className="flex flex-wrap justify-center gap-3 min-h-[80px]">
                                {scrambled.split('').map((char, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            w-14 h-16 md:w-16 md:h-20 bg-yellow-300 border-4 border-black 
                                            flex items-center justify-center text-3xl md:text-4xl font-black uppercase shadow-neo
                                            transform transition-all duration-300
                                            ${feedback === 'correct' ? 'bg-green-400 scale-110 rotate-12' : ''}
                                            ${feedback === 'wrong' ? 'bg-red-400 shake' : 'hover:-translate-y-2'}
                                        `}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {char}
                                    </div>
                                ))}
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto w-full">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className={`
                                        w-full text-center text-3xl font-black p-4 border-4 border-black shadow-neo 
                                        focus:outline-none focus:shadow-neo-lg transition-all uppercase tracking-widest
                                        ${feedback === 'correct' ? 'border-green-500 text-green-600' : ''}
                                        ${feedback === 'wrong' ? 'border-red-500 text-red-600' : ''}
                                    `}
                                    placeholder="Type answer..."
                                    autoFocus
                                    disabled={!isPlaying || feedback === 'correct'}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={useHint}
                                        disabled={hintUsed || !isPlaying}
                                        className={`
                                            p-2 rounded-full border-2 border-black transition-all
                                            ${hintUsed
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'bg-yellow-300 text-black hover:bg-yellow-400 hover:scale-110'}
                                        `}
                                        title="Use Hint (-50 pts)"
                                    >
                                        <Lightbulb className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>

                            <p className="text-slate-500 font-bold text-sm">
                                Press ENTER to submit • Hint costs 50 points
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WordScramble;
