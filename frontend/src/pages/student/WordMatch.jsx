import React, { useState, useEffect } from 'react';
import { Timer, RefreshCw, Trophy, ArrowLeft, Star, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// Extended word list for multiple levels
const WORD_DATABASE = [
    { id: 1, english: 'Apple', korean: '사과' },
    { id: 2, english: 'School', korean: '학교' },
    { id: 3, english: 'Friend', korean: '친구' },
    { id: 4, english: 'Book', korean: '책' },
    { id: 5, english: 'Computer', korean: '컴퓨터' },
    { id: 6, english: 'Water', korean: '물' },
    { id: 7, english: 'Music', korean: '음악' },
    { id: 8, english: 'Time', korean: '시간' },
    { id: 9, english: 'Money', korean: '돈' },
    { id: 10, english: 'Love', korean: '사랑' },
    { id: 11, english: 'Dream', korean: '꿈' },
    { id: 12, english: 'House', korean: '집' },
    { id: 13, english: 'Car', korean: '자동차' },
    { id: 14, english: 'Tree', korean: '나무' },
    { id: 15, english: 'Sky', korean: '하늘' },
    { id: 16, english: 'Ocean', korean: '바다' },
    { id: 17, english: 'Mountain', korean: '산' },
    { id: 18, english: 'Flower', korean: '꽃' }
];

const LEVELS = {
    1: { pairs: 4, time: 30, cols: 4 },
    2: { pairs: 8, time: 60, cols: 4 },
    3: { pairs: 12, time: 90, cols: 6 }
};

const WordMatch = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [level, setLevel] = useState(1);
    const [showLevelComplete, setShowLevelComplete] = useState(false);

    useEffect(() => {
        initializeGame(1);
    }, []);

    useEffect(() => {
        let timer;
        if (gameStarted && !gameOver && !showLevelComplete && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStarted && !showLevelComplete) {
            setGameOver(true);
        }
        return () => clearInterval(timer);
    }, [gameStarted, gameOver, showLevelComplete, timeLeft]);

    const initializeGame = (lvl) => {
        const config = LEVELS[lvl];
        // Select random words for this level
        const shuffledWords = [...WORD_DATABASE]
            .sort(() => Math.random() - 0.5)
            .slice(0, config.pairs);

        const gameCards = [...shuffledWords, ...shuffledWords]
            .map((word, index) => ({
                id: index,
                wordId: word.id,
                content: index < config.pairs ? word.english : word.korean,
                type: index < config.pairs ? 'english' : 'korean',
                isFlipped: false,
                isSolved: false,
            }))
            .sort(() => Math.random() - 0.5);

        setCards(gameCards);
        setFlipped([]);
        setSolved([]);
        setTimeLeft(config.time);
        setGameOver(false);
        setShowLevelComplete(false);
        setGameStarted(false);
        setLevel(lvl);
        if (lvl === 1) setScore(0);
    };

    const handleCardClick = (id) => {
        if (!gameStarted) setGameStarted(true);
        if (disabled || gameOver || showLevelComplete) return;

        const clickedCard = cards.find(card => card.id === id);
        if (clickedCard.isSolved || flipped.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setDisabled(true);
            const [firstId, secondId] = newFlipped;
            const firstCard = cards.find(card => card.id === firstId);
            const secondCard = cards.find(card => card.id === secondId);

            if (firstCard.wordId === secondCard.wordId) {
                // Match found
                const newSolved = [...solved, firstId, secondId];
                setSolved(newSolved);
                setScore(prev => prev + 100 + (timeLeft * 2)); // Bonus for speed
                setFlipped([]);
                setDisabled(false);

                // Check level completion
                if (newSolved.length === cards.length) {
                    handleLevelComplete();
                }
            } else {
                // No match
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const handleLevelComplete = () => {
        if (level < 3) {
            setShowLevelComplete(true);
        } else {
            setGameOver(true); // Game Completed
        }
    };

    const nextLevel = () => {
        initializeGame(level + 1);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link to="/student/games">
                    <Button variant="secondary" className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Grid className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-black text-xl font-mono">LVL {level}</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Timer className="w-5 h-5 mr-2 text-red-500" />
                        <span className={`font-black text-xl font-mono ${timeLeft < 10 ? 'text-red-600 animate-pulse' : ''}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="font-black text-xl font-mono">{score}</span>
                    </div>
                </div>
            </div>

            {showLevelComplete ? (
                <Card className="text-center p-12 border-4 border-black shadow-neo-lg bg-green-300 animate-bounce-in">
                    <Star className="w-24 h-24 mx-auto mb-6 text-yellow-500 fill-current" />
                    <h2 className="text-4xl font-black mb-4 uppercase">Level {level} Complete!</h2>
                    <p className="text-2xl font-bold mb-8">Score: {score}</p>
                    <Button onClick={nextLevel} className="bg-black text-white hover:bg-slate-800 text-xl px-8 py-4">
                        Next Level <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                    </Button>
                </Card>
            ) : gameOver ? (
                <Card className="text-center p-12 border-4 border-black shadow-neo-lg bg-yellow-300">
                    <Trophy className="w-24 h-24 mx-auto mb-6 text-black" />
                    <h2 className="text-4xl font-black mb-4 uppercase">
                        {solved.length === cards.length ? 'All Levels Cleared!' : 'Game Over!'}
                    </h2>
                    <p className="text-2xl font-bold mb-8">Final Score: {score}</p>
                    <Button onClick={() => initializeGame(1)} className="bg-black text-white hover:bg-slate-800">
                        <RefreshCw className="w-5 h-5 mr-2" /> Play Again
                    </Button>
                </Card>
            ) : (
                <div className={`grid gap-4 transition-all duration-300`}
                    style={{ gridTemplateColumns: `repeat(${LEVELS[level].cols}, minmax(0, 1fr))` }}>
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={`
                                aspect-[4/3] cursor-pointer transition-all duration-300 transform perspective-1000
                                ${flipped.includes(card.id) || solved.includes(card.id) ? 'rotate-y-180' : ''}
                            `}
                        >
                            <div className={`
                                w-full h-full border-4 border-black shadow-neo flex items-center justify-center p-2 text-center font-bold select-none transition-all rounded-lg
                                ${solved.includes(card.id)
                                    ? 'bg-green-400 opacity-50 scale-95'
                                    : flipped.includes(card.id)
                                        ? 'bg-white'
                                        : 'bg-black hover:-translate-y-1 hover:shadow-neo-lg'}
                            `}>
                                {flipped.includes(card.id) || solved.includes(card.id) ? (
                                    <span className="text-black text-lg sm:text-xl break-words leading-tight">{card.content}</span>
                                ) : (
                                    <span className="text-white text-3xl font-black opacity-20">?</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WordMatch;
