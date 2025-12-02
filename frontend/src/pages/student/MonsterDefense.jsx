import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, RefreshCw, Trophy, ArrowLeft, Heart, Zap, Crosshair, Bomb } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { saveScore } from '../../services/gameScoreService';

const WORD_PAIRS = [
    { k: '사과', e: 'apple' }, { k: '바나나', e: 'banana' }, { k: '체리', e: 'cherry' },
    { k: '학교', e: 'school' }, { k: '선생님', e: 'teacher' }, { k: '학생', e: 'student' },
    { k: '컴퓨터', e: 'computer' }, { k: '친구', e: 'friend' }, { k: '가족', e: 'family' },
    { k: '집', e: 'house' }, { k: '정원', e: 'garden' }, { k: '꽃', e: 'flower' },
    { k: '나무', e: 'tree' }, { k: '산', e: 'mountain' }, { k: '강', e: 'river' },
    { k: '바다', e: 'ocean' }, { k: '하늘', e: 'sky' }, { k: '구름', e: 'cloud' },
    { k: '비', e: 'rain' }, { k: '태양', e: 'sun' }, { k: '달', e: 'moon' },
    { k: '별', e: 'star' }, { k: '우주', e: 'space' }, { k: '지구', e: 'earth' },
    { k: '음악', e: 'music' }, { k: '예술', e: 'art' }, { k: '춤', e: 'dance' },
    { k: '노래', e: 'song' }, { k: '행복', e: 'happy' }, { k: '꿈', e: 'dream' },
    { k: '희망', e: 'hope' }, { k: '사랑', e: 'love' }, { k: '평화', e: 'peace' },
    { k: '자유', e: 'freedom' }, { k: '용기', e: 'courage' }, { k: '지혜', e: 'wisdom' }
];

const MONSTERS = ['👾', '👹', '👻', '👽', '🤖', '🧟', '🧛', '🐉', '🕷️', '🦂'];

const MonsterDefense = () => {
    const [monsters, setMonsters] = useState([]);
    const [projectiles, setProjectiles] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(1);

    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    const inputRef = useRef(null);
    const gameAreaRef = useRef(null);

    const { user } = useAuth();
    const scoreRef = useRef(0);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    // Game Loop
    const animate = useCallback((time) => {
        if (!isPlaying || gameOver) return;

        // Spawn monsters
        const spawnRate = Math.max(2000 - (level * 150), 600);
        if (time - lastSpawnTime.current > spawnRate) {
            spawnMonster();
            lastSpawnTime.current = time;
        }

        // Update Monsters
        setMonsters(prev => {
            const newMonsters = prev.map(m => ({
                ...m,
                y: m.y + m.speed * (1 + level * 0.1)
            }));

            // Check collision with bottom (player)
            const hitMonsters = newMonsters.filter(m => m.y > 85);
            if (hitMonsters.length > 0) {
                setLives(l => {
                    const newLives = l - hitMonsters.length;
                    if (newLives <= 0) {
                        setGameOver(true);
                        setIsPlaying(false);
                        saveScore('Monster Defense', scoreRef.current, user?.full_name || user?.username || 'Student');
                        window.dispatchEvent(new Event('gameScoreUpdated'));
                    }
                    return Math.max(0, newLives);
                });
                // Trigger explosion at bottom for missed monsters
                hitMonsters.forEach(m => {
                    addExplosion(m.x, 90);
                });
                return newMonsters.filter(m => m.y <= 85);
            }
            return newMonsters;
        });

        // Update Projectiles
        setProjectiles(prev => {
            const newProjectiles = prev.map(p => ({
                ...p,
                y: p.y - 2 // Projectile speed
            })).filter(p => p.y > 0);
            return newProjectiles;
        });

        // Update Explosions (remove old ones)
        setExplosions(prev => prev.filter(e => Date.now() - e.id < 500));

        requestRef.current = requestAnimationFrame(animate);
    }, [isPlaying, gameOver, level, user]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, gameOver, animate]);

    // Level up
    useEffect(() => {
        const newLevel = Math.floor(score / 500) + 1;
        if (newLevel > level) setLevel(newLevel);
    }, [score, level]);

    useEffect(() => {
        if (isPlaying && !gameOver && inputRef.current) {
            // Small timeout to ensure DOM is ready/enabled
            setTimeout(() => inputRef.current.focus(), 10);
        }
    }, [isPlaying, gameOver]);

    const spawnMonster = () => {
        const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
        const monsterType = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
        const id = Date.now() + Math.random();
        const startX = Math.random() * 80 + 10; // 10% to 90%

        setMonsters(prev => [...prev, {
            id,
            korean: pair.k,
            english: pair.e,
            monster: monsterType,
            x: startX,
            y: 0,
            speed: 0.1 + Math.random() * 0.15,
            hp: 1 // Could add HP for harder monsters later
        }]);
    };

    const addExplosion = (x, y) => {
        setExplosions(prev => [...prev, { id: Date.now(), x, y }]);
    };

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setLives(5);
        setLevel(1);
        setMonsters([]);
        setProjectiles([]);
        setExplosions([]);
        setInput('');
        lastSpawnTime.current = performance.now();
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        // Check for match
        const matchedMonsterIndex = monsters.findIndex(m => m.english.toLowerCase() === value.toLowerCase().trim());

        if (matchedMonsterIndex !== -1) {
            const target = monsters[matchedMonsterIndex];

            // Shoot projectile visually (instant hit logic for gameplay feel, but visual projectile)
            // Actually, for "Typing Shooter", instant hit is better.
            // Let's add an explosion at the monster's position immediately.
            addExplosion(target.x, target.y);

            setScore(prev => prev + 10 * target.english.length);
            setMonsters(prev => prev.filter((_, i) => i !== matchedMonsterIndex));
            setInput('');

            // Add a "laser" effect beam or projectile
            setProjectiles(prev => [...prev, { id: Date.now(), x: 50, y: 90, targetX: target.x, targetY: target.y }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setInput('');
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
                        <Crosshair className="w-5 h-5 mr-2 text-red-500" />
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
            <Card className="flex-1 border-4 border-black shadow-neo-lg bg-slate-900 relative overflow-hidden p-0 flex flex-col">
                {/* Background Stars */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {!isPlaying && !gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-30 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md">
                            <div className="w-20 h-20 bg-purple-500 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <span className="text-4xl">👾</span>
                            </div>
                            <h2 className="text-4xl font-black uppercase">Monster Defense</h2>
                            <p className="text-lg text-slate-600 font-bold">
                                Type the English words to shoot down the monsters!
                            </p>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 shadow-neo hover:shadow-neo-lg">
                                Start Mission
                            </Button>
                        </div>
                    </div>
                ) : gameOver ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 z-30 backdrop-blur-sm">
                        <div className="text-center space-y-6 p-8 border-4 border-black bg-white shadow-neo-lg max-w-md animate-bounce-in">
                            <Bomb className="w-24 h-24 mx-auto text-black" />
                            <h2 className="text-5xl font-black uppercase text-red-600">Game Over</h2>
                            <div className="space-y-2">
                                <p className="text-xl font-bold text-slate-500">Mission Score</p>
                                <p className="text-6xl font-black font-mono">{score}</p>
                            </div>
                            <Button onClick={startGame} className="w-full bg-black text-white hover:bg-slate-800 text-xl py-4 mt-4">
                                <RefreshCw className="w-6 h-6 mr-2" /> Retry Mission
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* Game Layer */}
                <div ref={gameAreaRef} className="flex-1 relative overflow-hidden">
                    {/* Monsters */}
                    {monsters.map((m) => (
                        <div
                            key={m.id}
                            className="absolute transform -translate-x-1/2 flex flex-col items-center transition-transform"
                            style={{ left: `${m.x}%`, top: `${m.y}%` }}
                        >
                            <div className="text-5xl filter drop-shadow-lg animate-pulse">{m.monster}</div>
                            <div className="bg-black/50 text-white px-2 py-1 rounded text-sm font-bold mt-1 backdrop-blur-sm border border-white/30">
                                {m.korean}
                            </div>
                        </div>
                    ))}

                    {/* Explosions */}
                    {explosions.map((e) => (
                        <div
                            key={e.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-ping"
                            style={{ left: `${e.x}%`, top: `${e.y}%` }}
                        >
                            💥
                        </div>
                    ))}

                    {/* Player Cannon */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-t-full border-4 border-black flex items-center justify-center relative z-10">
                            <div className="w-4 h-8 bg-black absolute -top-4"></div>
                        </div>
                        <div className="w-24 h-8 bg-slate-700 border-4 border-black rounded-full -mb-4 relative z-0"></div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-800 border-t-4 border-black z-20">
                    <div className="max-w-xl mx-auto relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={!isPlaying || gameOver}
                            className="w-full text-center text-3xl font-black p-4 border-4 border-black shadow-[0_0_15px_rgba(59,130,246,0.5)] focus:outline-none focus:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all uppercase placeholder-slate-500 bg-slate-900 text-white"
                            placeholder={isPlaying ? "TYPE ENGLISH WORD..." : "READY?"}
                            autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className={`w-3 h-3 rounded-full border-2 border-white ${input.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MonsterDefense;
