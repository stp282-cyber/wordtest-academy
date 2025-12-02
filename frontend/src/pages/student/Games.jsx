import React, { useState } from 'react';
import { Keyboard, Type, LayoutGrid, Play, Trophy, Medal, Crown, Crosshair, X, Puzzle, Hammer, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

import { getTopScores, getAllScores } from '../../services/gameScoreService';

const GameCard = ({ icon: Icon, title, description, color, link, isNew }) => (
    <Card className="flex flex-col h-full border-4 border-black shadow-neo-lg hover:shadow-neo-lg hover:-translate-y-2 transition-all group cursor-pointer bg-white relative overflow-hidden">
        {isNew && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2 py-1 transform rotate-12 border-2 border-black shadow-sm z-10">
                NEW!
            </div>
        )}
        <div className={`w-full h-32 ${color} border-b-4 border-black flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent" />
            <Icon className="w-16 h-16 text-black group-hover:scale-110 transition-transform relative z-10" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-2xl font-black text-black uppercase mb-2">{title}</h3>
            <p className="text-slate-600 font-bold mb-6 flex-1">{description}</p>
            <Link to={link} className="w-full">
                <Button className="w-full bg-black text-white border-white shadow-neo group-hover:shadow-neo-lg hover:bg-slate-800">
                    Play Now <Play className="w-4 h-4 ml-2 fill-current" />
                </Button>
            </Link>
        </div>
    </Card>
);

const Games = () => {
    const [isRankingsOpen, setIsRankingsOpen] = useState(false);
    const [topPlayers, setTopPlayers] = useState([]);
    const [allRankings, setAllRankings] = useState([]);

    React.useEffect(() => {
        setTopPlayers(getTopScores(5));
        setAllRankings(getAllScores());

        // Listen for storage updates (in case game played in another tab, though unlikely here, good practice)
        const handleStorageChange = () => {
            setTopPlayers(getTopScores(5));
            setAllRankings(getAllScores());
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('gameScoreUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('gameScoreUpdated', handleStorageChange);
        };
    }, []);

    return (
        <div className="space-y-8 relative">
            {/* Rankings Modal */}
            {isRankingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b-4 border-black flex justify-between items-center bg-yellow-300">
                            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                                <Trophy className="w-6 h-6" /> All Rankings
                            </h2>
                            <Button onClick={() => setIsRankingsOpen(false)} variant="ghost" className="hover:bg-black/10">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="overflow-y-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-100 border-b-2 border-black sticky top-0">
                                    <tr>
                                        <th className="p-4 font-black uppercase text-sm">Rank</th>
                                        <th className="p-4 font-black uppercase text-sm">Player</th>
                                        <th className="p-4 font-black uppercase text-sm">Game</th>
                                        <th className="p-4 font-black uppercase text-sm text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-100">
                                    {allRankings.map((player, index) => (
                                        <tr key={player.id} className="hover:bg-yellow-50 transition-colors font-bold">
                                            <td className="p-4">
                                                <div className={`
                                                    w-8 h-8 flex items-center justify-center font-black rounded-full border-2 border-black shadow-sm
                                                    ${index === 0 ? 'bg-yellow-400' :
                                                        index === 1 ? 'bg-slate-300' :
                                                            index === 2 ? 'bg-orange-300' : 'bg-white'}
                                                `}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 flex items-center gap-3">
                                                <span className="text-2xl">{player.avatar}</span>
                                                {player.name}
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm uppercase">{player.game}</td>
                                            <td className="p-4 text-right font-mono text-lg">{player.score.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border-4 border-black p-6 shadow-neo-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                <h1 className="text-4xl font-black text-black mb-2 uppercase italic relative z-10">Arcade Zone</h1>
                <p className="text-slate-600 font-bold font-mono relative z-10">Play games, earn points, and master your vocabulary!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <GameCard
                    icon={LayoutGrid}
                    title="Word Match"
                    description="Match English words with their Korean meanings. Test your memory!"
                    color="bg-blue-300"
                    link="/student/games/match"
                    isNew={true}
                />
                <GameCard
                    icon={Puzzle}
                    title="Word Scramble"
                    description="Unscramble the letters to find the hidden word! A puzzle for your brain."
                    color="bg-yellow-300"
                    link="/student/games/scramble"
                    isNew={true}
                />
                <GameCard
                    icon={Keyboard}
                    title="Speed Typing"
                    description="Type the words as fast as you can! Race against the clock."
                    color="bg-red-300"
                    link="/student/games/typing"
                />
                <GameCard
                    icon={Crosshair}
                    title="Monster Defense"
                    description="Defend your base! Type English words to shoot down incoming monsters."
                    color="bg-purple-300"
                    link="/student/games/defense"
                    isNew={true}
                />
                <GameCard
                    icon={Search}
                    title="Word Search"
                    description="Find the hidden English words in the grid! A classic puzzle."
                    color="bg-green-300"
                    link="/student/games/search"
                    isNew={true}
                />
                <GameCard
                    icon={Hammer}
                    title="Word Whack"
                    description="Whack the mole with the correct English word! Fast-paced fun."
                    color="bg-orange-300"
                    link="/student/games/whack"
                    isNew={true}
                />
            </div>

            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">
                        <Trophy className="w-6 h-6 inline-block mr-2 mb-1 text-yellow-500" />
                        Top Players
                    </h2>
                    <Button onClick={() => setIsRankingsOpen(true)} variant="secondary" className="text-sm">View All Rankings</Button>
                </div>

                <Card className="overflow-hidden bg-white p-0 border-4 border-black shadow-neo-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 border-b-2 border-black">
                                <tr>
                                    <th className="p-4 font-black uppercase text-sm">Rank</th>
                                    <th className="p-4 font-black uppercase text-sm">Player</th>
                                    <th className="p-4 font-black uppercase text-sm">Game</th>
                                    <th className="p-4 font-black uppercase text-sm text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100">
                                {topPlayers.map((player, index) => (
                                    <tr key={player.id} className="hover:bg-yellow-50 transition-colors font-bold">
                                        <td className="p-4">
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center font-black rounded-full border-2 border-black shadow-sm
                                                ${index === 0 ? 'bg-yellow-400' :
                                                    index === 1 ? 'bg-slate-300' :
                                                        index === 2 ? 'bg-orange-300' : 'bg-white'}
                                            `}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4 flex items-center gap-3">
                                            <span className="text-2xl">{player.avatar}</span>
                                            {player.name}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm uppercase">{player.game}</td>
                                        <td className="p-4 text-right font-mono text-lg">{player.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Games;
