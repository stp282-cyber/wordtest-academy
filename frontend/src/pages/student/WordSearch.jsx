import React, { useState, useEffect, useRef } from 'react';
import { Timer, RefreshCw, Trophy, ArrowLeft, Search, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { saveScore } from '../../services/gameScoreService';
import { useAuth } from '../../context/AuthContext';

const WORD_DATA = [
    { e: 'APPLE', k: '사과' }, { e: 'BANANA', k: '바나나' }, { e: 'CAT', k: '고양이' },
    { e: 'DOG', k: '개' }, { e: 'EGG', k: '달걀' }, { e: 'FISH', k: '물고기' },
    { e: 'GIRL', k: '소녀' }, { e: 'HAT', k: '모자' }, { e: 'ICE', k: '얼음' },
    { e: 'JUMP', k: '점프하다' }, { e: 'KITE', k: '연' }, { e: 'LION', k: '사자' },
    { e: 'MOM', k: '엄마' }, { e: 'NOSE', k: '코' }, { e: 'ORANGE', k: '오렌지' },
    { e: 'PEN', k: '펜' }, { e: 'QUEEN', k: '여왕' }, { e: 'RED', k: '빨간색' },
    { e: 'SUN', k: '태양' }, { e: 'TREE', k: '나무' }, { e: 'UP', k: '위로' },
    { e: 'VAN', k: '밴' }, { e: 'WATER', k: '물' }, { e: 'BOX', k: '상자' },
    { e: 'YELLOW', k: '노란색' }, { e: 'ZOO', k: '동물원' }, { e: 'BOOK', k: '책' },
    { e: 'DESK', k: '책상' }, { e: 'SCHOOL', k: '학교' }, { e: 'FRIEND', k: '친구' }
];

const GRID_SIZE = 10;

const WordSearch = () => {
    const { user } = useAuth();
    const [grid, setGrid] = useState([]);
    const [targetWords, setTargetWords] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const timerRef = useRef(null);
    const scoreRef = useRef(0);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

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

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        clearInterval(timerRef.current);
        saveScore('Word Search', scoreRef.current, user?.full_name || user?.username || 'Student');
        window.dispatchEvent(new Event('gameScoreUpdated'));
    };

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(120);
        setFoundWords([]);
        setSelectedCells([]);
        generateGrid();
    };

    const generateGrid = () => {
        // 1. Select 5 random words
        const shuffled = [...WORD_DATA].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setTargetWords(selected);

        // 2. Initialize empty grid
        let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

        // 3. Place words
        const directions = [
            { x: 1, y: 0 }, // Horizontal
            { x: 0, y: 1 }, // Vertical
            { x: 1, y: 1 }  // Diagonal
        ];

        selected.forEach(wordObj => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const word = wordObj.e;
                let row, col;

                // Determine start position limits based on direction and word length
                if (dir.x === 1 && dir.y === 0) { // Horizontal
                    row = Math.floor(Math.random() * GRID_SIZE);
                    col = Math.floor(Math.random() * (GRID_SIZE - word.length));
                } else if (dir.x === 0 && dir.y === 1) { // Vertical
                    row = Math.floor(Math.random() * (GRID_SIZE - word.length));
                    col = Math.floor(Math.random() * GRID_SIZE);
                } else { // Diagonal
                    row = Math.floor(Math.random() * (GRID_SIZE - word.length));
                    col = Math.floor(Math.random() * (GRID_SIZE - word.length));
                }

                // Check if fits
                let fits = true;
                for (let i = 0; i < word.length; i++) {
                    const cell = newGrid[row + i * dir.y][col + i * dir.x];
                    if (cell !== '' && cell !== word[i]) {
                        fits = false;
                        break;
                    }
                }

                if (fits) {
                    for (let i = 0; i < word.length; i++) {
                        newGrid[row + i * dir.y][col + i * dir.x] = word[i];
                    }
                    placed = true;
                }
                attempts++;
            }
        });

        // 4. Fill empty cells with random letters
        const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (newGrid[i][j] === '') {
                    newGrid[i][j] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                }
            }
        }

        setGrid(newGrid);
    };

    const handleMouseDown = (row, col) => {
        if (!isPlaying) return;
        setIsSelecting(true);
        setSelectedCells([{ row, col }]);
    };

    const handleMouseEnter = (row, col) => {
        if (!isPlaying || !isSelecting) return;

        // Only allow straight lines (horizontal, vertical, diagonal)
        const start = selectedCells[0];
        const dx = col - start.col;
        const dy = row - start.row;

        // Check if valid line
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
            // Calculate all cells in between
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            const xStep = dx === 0 ? 0 : dx / steps;
            const yStep = dy === 0 ? 0 : dy / steps;

            const newSelection = [];
            for (let i = 0; i <= steps; i++) {
                newSelection.push({
                    row: start.row + i * yStep,
                    col: start.col + i * xStep
                });
            }
            setSelectedCells(newSelection);
        }
    };

    const handleMouseUp = () => {
        if (!isPlaying || !isSelecting) return;
        setIsSelecting(false);

        // Check if selected word matches any target
        const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
        const matchedWord = targetWords.find(w => w.e === selectedWord && !foundWords.includes(w.e));

        if (matchedWord) {
            // Correct!
            setFoundWords(prev => [...prev, matchedWord.e]);
            setScore(prev => prev + 100 + (matchedWord.e.length * 10));

            // Check if all words found
            if (foundWords.length + 1 === targetWords.length) {
                // Level Complete logic could go here, for now just bonus and end
                setScore(prev => prev + 500); // Completion bonus
                setTimeout(endGame, 500);
            }
        }

        setSelectedCells([]);
    };

    const isCellSelected = (row, col) => {
        return selectedCells.some(cell => cell.row === row && cell.col === col);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col select-none" onMouseUp={handleMouseUp}>
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <Link to="/student/games">
                    <Button variant="secondary" className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Timer className={`w-5 h-5 mr-2 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-black'}`} />
                        <span className="font-black text-xl font-mono">{timeLeft}s</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="font-black text-xl font-mono">{score}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                {/* Word List */}
                <Card className="w-full md:w-64 border-4 border-black shadow-neo bg-blue-50 flex flex-col">
                    <h3 className="text-xl font-black uppercase mb-4 flex items-center">
                        <Search className="w-5 h-5 mr-2" /> Find Words
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {targetWords.map((word, i) => (
                            <div
                                key={i}
                                className={`
                                    p-3 border-2 border-black font-bold transition-all
                                    ${foundWords.includes(word.e)
                                        ? 'bg-green-400 text-green-900 line-through opacity-50'
                                        : 'bg-white shadow-sm'}
                                `}
                            >
                                <div className="text-sm text-slate-500">{word.k}</div>
                                <div className="text-lg">{word.e}</div>
                            </div>
                        ))}
                        {targetWords.length === 0 && !isPlaying && (
                            <div className="text-slate-500 italic text-center mt-10">
                                Press Start to play!
                            </div>
                        )}
                    </div>
                </Card>

                {/* Game Grid */}
                <Card className="flex-1 border-4 border-black shadow-neo-lg bg-white relative overflow-hidden flex flex-col items-center justify-center p-4">
                    {!isPlaying && !gameOver ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 backdrop-blur-sm">
                            <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md">
                                <Search className="w-20 h-20 mx-auto text-blue-500" />
                                <h2 className="text-4xl font-black uppercase text-blue-600">Word Search</h2>
                                <p className="text-lg text-slate-600 font-bold">
                                    Find the hidden English words in the grid!
                                </p>
                                <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 shadow-neo hover:shadow-neo-lg">
                                    Start Puzzle
                                </Button>
                            </div>
                        </div>
                    ) : gameOver ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/90 z-20 backdrop-blur-sm">
                            <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md animate-bounce-in">
                                <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                                <h2 className="text-5xl font-black uppercase">Finished!</h2>
                                <p className="text-xl font-bold text-slate-500">Score: {score}</p>
                                <div className="text-left bg-slate-100 p-4 rounded border-2 border-slate-200">
                                    <p className="font-bold mb-2">Found: {foundWords.length} / {targetWords.length}</p>
                                </div>
                                <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 mt-4">
                                    <RefreshCw className="w-6 h-6 mr-2" /> Play Again
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {/* Grid Render */}
                    <div
                        className="grid gap-1 bg-slate-200 p-2 border-4 border-black shadow-neo"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
                        }}
                        onMouseLeave={() => setIsSelecting(false)}
                    >
                        {grid.map((row, rIndex) => (
                            row.map((cell, cIndex) => (
                                <div
                                    key={`${rIndex}-${cIndex}`}
                                    className={`
                                        w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
                                        font-black text-lg md:text-xl cursor-pointer select-none rounded-sm transition-colors
                                        ${isCellSelected(rIndex, cIndex)
                                            ? 'bg-yellow-400 text-black transform scale-110 z-10 shadow-sm'
                                            : 'bg-white hover:bg-slate-100'}
                                    `}
                                    onMouseDown={() => handleMouseDown(rIndex, cIndex)}
                                    onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                                >
                                    {cell}
                                </div>
                            ))
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WordSearch;
