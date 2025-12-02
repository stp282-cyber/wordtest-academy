import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, RefreshCw, Trophy, ArrowLeft, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const WORDS = [
    'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
    'school', 'teacher', 'student', 'pencil', 'notebook', 'computer', 'keyboard',
    'friend', 'family', 'house', 'garden', 'flower', 'tree', 'mountain', 'river',
    'ocean', 'cloud', 'rain', 'sun', 'moon', 'star', 'space', 'planet', 'earth',
    'music', 'art', 'dance', 'song', 'happy', 'smile', 'laugh', 'dream', 'hope'
];

const COLORS = ['bg-yellow-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300', 'bg-orange-300'];

const SpeedTyping = () => {
    const [activeWords, setActiveWords] = useState([]);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(1);

    const gameAreaRef = useRef(null);
    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    const inputRef = useRef(null);

    // Game Loop
    const animate = useCallback((time) => {
        if (!isPlaying || gameOver) return;

        // Spawn new words
        if (time - lastSpawnTime.current > Math.max(2000 - (level * 200), 500)) {
            spawnWord();
            lastSpawnTime.current = time;
        }

        // Update word positions
        setActiveWords(prevWords => {
            const newWords = prevWords.map(word => ({
                ...word,
                y: word.y + word.speed * (1 + level * 0.1)
            }));

            // Check collisions with bottom
            const missedWords = newWords.filter(word => word.y > 85); // 85% height
            if (missedWords.length > 0) {
                setLives(prev => {
                    const newLives = prev - missedWords.length;
                    if (newLives <= 0) {
                        setGameOver(true);
                        setIsPlaying(false);
                    }
                    return Math.max(0, newLives);
                });
                return newWords.filter(word => word.y <= 85);
            }

            return newWords;
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [isPlaying, gameOver, level]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, gameOver, animate]);

    // Level up based on score
    useEffect(() => {
        const newLevel = Math.floor(score / 500) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
        }
    }, [score, level]);

    const spawnWord = () => {
        const wordText = WORDS[Math.floor(Math.random() * WORDS.length)];
        const id = Date.now() + Math.random();
        const startX = Math.random() * 80 + 5; // 5% to 85% width
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        setActiveWords(prev => [...prev, {
            id,
            text: wordText,
            x: startX,
            y: 0,
            speed: 0.2 + Math.random() * 0.2,
            color
        }]);
    };

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setLives(5);
        setLevel(1);
        setActiveWords([]);
        setInput('');
        lastSpawnTime.current = performance.now();
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        const matchedWordIndex = activeWords.findIndex(w => w.text.toLowerCase() === value.toLowerCase().trim());

        if (matchedWordIndex !== -1) {
            // Word matched!
            const matchedWord = activeWords[matchedWordIndex];
            setScore(prev => prev + 10 * matchedWord.text.length);
            setActiveWords(prev => prev.filter((_, i) => i !== matchedWordIndex));
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setInput('');
        }
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
                        <Zap className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                        <span className="font-black text-xl font-mono">LVL {level}</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Heart className="w-5 h-5 mr-2 text-red-500 fill-current" />
                        <span className="font-black text-xl font-mono">{lives}</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="font-black text-xl font-mono">{score}</span>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <Card className="flex-1 border-4 border-black shadow-neo-lg bg-slate-100 relative overflow-hidden p-0 flex flex-col">
                {!isPlaying && !gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md">
                            <div className="w-20 h-20 bg-yellow-300 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-10 h-10 text-black" />
                            </div>
                            <h2 className="text-4xl font-black uppercase">Word Rain</h2>
                            <p className="text-lg text-slate-600 font-bold">
                                Type the falling words before they hit the ground!
                            </p>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 shadow-neo hover:shadow-neo-lg">
                                Start Game
                            </Button>
                        </div>
                    </div>
                ) : gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/90 z-20 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md animate-bounce-in">
                            <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                            <h2 className="text-5xl font-black uppercase">Game Over</h2>
                            <div className="space-y-2">
                                <p className="text-xl font-bold text-slate-500">Final Score</p>
                                <p className="text-6xl font-black font-mono">{score}</p>
                            </div>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 mt-4">
                                <RefreshCw className="w-6 h-6 mr-2" /> Try Again
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* Falling Words Layer */}
                <div ref={gameAreaRef} className="flex-1 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    {activeWords.map((word) => (
                        <div
                            key={word.id}
                            className={`absolute px-4 py-2 rounded-full border-2 border-black font-black text-sm shadow-neo-sm transform -translate-x-1/2 transition-transform ${word.color}`}
                            style={{
                                left: `${word.x}%`,
                                top: `${word.y}%`,
                            }}
                        >
                            {word.text}
                        </div>
                    ))}

                    {/* Danger Zone Line */}
                    <div className="absolute bottom-[15%] left-0 right-0 border-t-4 border-red-500 border-dashed opacity-50 pointer-events-none" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t-4 border-black z-10">
                    <div className="max-w-xl mx-auto relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={!isPlaying || gameOver}
                            className="w-full text-center text-3xl font-black p-4 border-4 border-black shadow-neo focus:outline-none focus:shadow-neo-lg transition-all uppercase placeholder-slate-300"
                            placeholder={isPlaying ? "TYPE HERE..." : "PRESS START"}
                            autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className={`w-3 h-3 rounded-full border-2 border-black ${input.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SpeedTyping;
