import React from 'react';
import { Keyboard, Type, LayoutGrid, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const GameCard = ({ icon: Icon, title, description, color, link }) => (
    <Card className="flex flex-col h-full border-4 border-black shadow-neo-lg hover:shadow-neo-lg hover:-translate-y-2 transition-all group cursor-pointer bg-white">
        <div className={`w-full h-32 ${color} border-b-4 border-black flex items-center justify-center`}>
            <Icon className="w-16 h-16 text-black group-hover:scale-110 transition-transform" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-2xl font-black text-black uppercase mb-2">{title}</h3>
            <p className="text-slate-600 font-bold mb-6 flex-1">{description}</p>
            <Link to={link} className="w-full">
                <Button className="w-full bg-black text-white border-white shadow-neo group-hover:shadow-neo-lg">
                    Play Now <Play className="w-4 h-4 ml-2 fill-current" />
                </Button>
            </Link>
        </div>
    </Card>
);

const Games = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white border-4 border-black p-6 shadow-neo-lg">
                <h1 className="text-4xl font-black text-black mb-2 uppercase italic">Arcade Zone</h1>
                <p className="text-slate-600 font-bold font-mono">Play games, earn points, and master your vocabulary!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <GameCard
                    icon={LayoutGrid}
                    title="Word Match"
                    description="Match English words with their Korean meanings. (Coming Soon)"
                    color="bg-blue-300"
                    link="#"
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
                    description="Type the words as fast as you can! (Coming Soon)"
                    color="bg-red-300"
                    link="#"
                />
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4 mb-6">Top Players</h2>
                <Card className="overflow-hidden bg-white p-0">
                    {[1, 2, 3].map((rank) => (
                        <div key={rank} className="flex items-center px-6 py-4 border-b-2 border-black last:border-0 hover:bg-slate-50">
                            <div className={`
                w-10 h-10 flex items-center justify-center font-black text-xl border-2 border-black mr-4 shadow-neo-sm
                ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-300' : 'bg-orange-300'}
              `}>
                                {rank}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-black uppercase">Player Name</h4>
                                <p className="text-xs font-bold text-slate-500">Word Match Champion</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-primary font-mono">2,450</span>
                                <span className="text-xs font-bold text-slate-400 block">PTS</span>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default Games;
