import React, { useState, useEffect, useRef } from 'react';
import { Timer, RefreshCw, Trophy, ArrowLeft, Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { saveScore } from '../../services/gameScoreService';
import { useAuth } from '../../context/AuthContext';

const WORDS = [
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

const GRID_SIZE = 9; // 3x3 grid

const WordWhack = () => {
    const { user } = useAuth();
    const [moles, setMoles] = useState(Array(GRID_SIZE).fill(null)); // null or { word, isTarget }
    const [targetWord, setTargetWord] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0);

    const timerRef = useRef(null);
    const moleTimerRef = useRef(null);
    const scoreRef = useRef(0);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    // Game Loop
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
        if (isPlaying && !gameOver) {
            moleTimerRef.current = setInterval(spawnMoles, 1000); // Spawn every second
        }
        return () => clearInterval(moleTimerRef.current);
    }, [isPlaying, gameOver, targetWord]);

    const spawnMoles = () => {
        if (!targetWord) return;

        setMoles(prev => {
            const newMoles = [...prev];

            // Clear some old moles randomly
            for (let i = 0; i < GRID_SIZE; i++) {
                if (newMoles[i] && Math.random() > 0.5) newMoles[i] = null;
            }

            // Pick a random empty spot
            const emptyIndices = newMoles.map((m, i) => m === null ? i : -1).filter(i => i !== -1);
            if (emptyIndices.length === 0) return newMoles;

            const spawnIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

            // Decide if it's the target word or a distractor
            const isTarget = Math.random() > 0.6; // 40% chance of target
            let wordToShow;

            if (isTarget) {
                wordToShow = targetWord.e;
            } else {
                // Pick a random distractor
                let distractor;
                do {
                    distractor = WORDS[Math.floor(Math.random() * WORDS.length)];
                } while (distractor.e === targetWord.e);
                wordToShow = distractor.e;
            }

            newMoles[spawnIndex] = { word: wordToShow, isTarget: wordToShow === targetWord.e, id: Date.now() };
            return newMoles;
        });
    };

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(60);
        setCombo(0);
        setMoles(Array(GRID_SIZE).fill(null));
        pickNewTarget();
    };

    const pickNewTarget = () => {
        const newTarget = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(newTarget);
        // Clear moles immediately to avoid confusion
        setMoles(Array(GRID_SIZE).fill(null));
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        clearInterval(timerRef.current);
        clearInterval(moleTimerRef.current);
        saveScore('Word Whack', scoreRef.current, user?.full_name || user?.username || 'Student');
        window.dispatchEvent(new Event('gameScoreUpdated'));
    };

    const handleWhack = (index) => {
        if (!isPlaying || !moles[index]) return;

        const mole = moles[index];

        if (mole.isTarget) {
            // Correct!
            setScore(prev => prev + 100 + (combo * 10));
            setCombo(prev => prev + 1);
            // Visual feedback could go here
            pickNewTarget();
        } else {
            // Wrong!
            setScore(prev => Math.max(0, prev - 50));
            setCombo(0);
            // Shake effect?
        }

        // Remove the whacked mole
        setMoles(prev => {
            const newMoles = [...prev];
            newMoles[index] = null;
            return newMoles;
        });
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
                        <span className="font-black text-xl font-mono">{timeLeft}s</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="font-black text-xl font-mono">{score}</span>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <Card className="flex-1 border-4 border-black shadow-neo-lg bg-amber-100 relative overflow-hidden p-0 flex flex-col items-center justify-center">
                {!isPlaying && !gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md">
                            <h2 className="text-4xl font-black uppercase text-amber-700">Word Whack 🔨</h2>
                            <p className="text-lg text-slate-600 font-bold">
                                Whack the mole with the correct English word!
                            </p>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 shadow-neo hover:shadow-neo-lg">
                                Start Game
                            </Button>
                        </div>
                    </div>
                ) : gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-900/90 z-20 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md animate-bounce-in">
                            <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                            <h2 className="text-5xl font-black uppercase">Time's Up!</h2>
                            <p className="text-xl font-bold text-slate-500">Score: {score}</p>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 mt-4">
                                <RefreshCw className="w-6 h-6 mr-2" /> Play Again
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* Target Display */}
                <div className="mb-8 text-center z-10">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Find this word:</p>
                    <div className="inline-block bg-white border-4 border-black px-12 py-4 shadow-neo transform -rotate-1">
                        <h1 className="text-5xl font-black text-black">{targetWord ? targetWord.k : '?'}</h1>
                    </div>
                </div>

                {/* Mole Grid */}
                <div className="grid grid-cols-3 gap-4 md:gap-8 p-4">
                    {moles.map((mole, index) => (
                        <div
                            key={index}
                            className="relative w-24 h-24 md:w-32 md:h-32 bg-amber-900/20 rounded-full border-b-4 border-amber-900/30"
                        >
                            {mole && (
                                <button
                                    onClick={() => handleWhack(index)}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 md:w-28 md:h-28 bg-amber-500 border-4 border-black rounded-t-full flex items-center justify-center hover:bg-amber-400 active:scale-95 transition-transform animate-in slide-in-from-bottom-10 duration-200"
                                >
                                    <span className="font-black text-sm md:text-lg text-center leading-tight px-1 break-words">
                                        {mole.word}
                                    </span>
                                    {/* Face */}
                                    <div className="absolute top-1/2 left-2 w-2 h-2 bg-black rounded-full"></div>
                                    <div className="absolute top-1/2 right-2 w-2 h-2 bg-black rounded-full"></div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-3 bg-pink-300 rounded-full"></div>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default WordWhack;
