import React from 'react';
import { Keyboard, Type, LayoutGrid, Play, Trophy, Medal, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

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
    const topPlayers = [
        { rank: 1, name: 'Sarah Kim', game: 'Word Match', score: 2450, avatar: '👑' },
        { rank: 2, name: 'Mike Lee', game: 'Speed Typing', score: 2100, avatar: '🥈' },
        { rank: 3, name: 'Jenny Park', game: 'Word Match', score: 1950, avatar: '🥉' },
        { rank: 4, name: 'Tom Chen', game: 'Speed Typing', score: 1800, avatar: '👾' },
        { rank: 5, name: 'Alex Cho', game: 'Flashcards', score: 1500, avatar: '📚' },
    ];

    return (
        <div className="space-y-8">
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
                    icon={Type}
                    title="Flashcards"
                    description="Classic flashcard learning. Flip cards and memorize words at your own pace."
                    color="bg-yellow-300"
                    link="/student/learning"
                />
                <GameCard
                    icon={Keyboard}
                    title="Speed Typing"
                    description="Type the words as fast as you can! Race against the clock."
                    color="bg-red-300"
                    link="/student/games/typing"
                    isNew={true}
                />
            </div>

            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">
                        <Trophy className="w-6 h-6 inline-block mr-2 mb-1 text-yellow-500" />
                        Top Players
                    </h2>
                    <Button variant="secondary" className="text-sm">View All Rankings</Button>
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
                                {topPlayers.map((player) => (
                                    <tr key={player.rank} className="hover:bg-yellow-50 transition-colors font-bold">
                                        <td className="p-4">
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center font-black rounded-full border-2 border-black shadow-sm
                                                ${player.rank === 1 ? 'bg-yellow-400' :
                                                    player.rank === 2 ? 'bg-slate-300' :
                                                        player.rank === 3 ? 'bg-orange-300' : 'bg-white'}
                                            `}>
                                                {player.rank}
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
