import React, { useEffect, useState } from 'react';
import { BookOpen, Trophy, Target, Clock, ArrowUpRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card hover className={`flex items-center p-5 border-2 border-black shadow-neo ${color}`}>
        <div className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center mr-4 shadow-sm">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="bg-white px-3 py-1 border-2 border-black shadow-neo-sm -rotate-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <h3 className="text-2xl font-black text-black">{value}</h3>
        </div>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        wordsLearned: 0,
        totalPoints: 0,
        accuracy: '0%',
        studyTime: '0h'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) return;

                // Fetch Analytics
                const analyticsRes = await client.get(`/analytics/student/${user.id}`);
                const results = analyticsRes.data;

                // Calculate Stats - handle both lowercase and uppercase column names
                const totalTests = results.length;
                const totalScore = results.reduce((acc, curr) => acc + (curr.SCORE || curr.score || 0), 0);
                const avgScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

                setStats({
                    wordsLearned: totalTests * 20, // Mock calculation
                    totalPoints: totalScore * 10,
                    accuracy: `${avgScore}%`,
                    studyTime: `${totalTests * 0.5}h`
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="p-8 text-center font-bold">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-6 shadow-neo-lg">
                <div>
                    <h1 className="text-4xl font-black text-black mb-1 uppercase italic">Hello, {user?.full_name || user?.username}! 👋</h1>
                    <p className="text-slate-600 font-mono font-bold">Ready to crush some vocabulary today?</p>
                </div>
                <Button size="lg" className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white">
                    Start Learning <ArrowUpRight className="ml-2 w-5 h-5" />
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Words" value={stats.wordsLearned} color="bg-blue-200" />
                <StatCard icon={Trophy} label="Points" value={stats.totalPoints} color="bg-yellow-200" />
                <StatCard icon={Target} label="Accuracy" value={stats.accuracy} color="bg-green-200" />
                <StatCard icon={Clock} label="Time" value={stats.studyTime} color="bg-purple-200" />
            </div>

            {/* Recent Activity & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Your Curriculum</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="neo-card flex items-center p-4 hover:bg-yellow-50 transition-colors cursor-pointer group relative">
                                <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent group-hover:border-black pointer-events-none transition-all" />

                                <div className="w-12 h-12 bg-black text-white border-2 border-black flex items-center justify-center font-black text-xl mr-4 shadow-neo-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                                    {item}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-lg text-black uppercase">Chapter {item}: Basic Vocabulary</h4>
                                    <p className="text-sm font-bold text-slate-500 font-mono">20 words • 15 mins</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 border-2 border-black bg-green-400 text-black text-xs font-black uppercase shadow-neo-sm">
                                        Completed
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Leaderboard</h2>
                    <Card className="p-0 overflow-hidden bg-white">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-center px-6 py-4 border-b-2 border-black last:border-0 hover:bg-slate-50 transition-colors">
                                <span className={`w-8 font-black text-xl ${item <= 3 ? 'text-accent' : 'text-slate-400'}`}>#{item}</span>
                                <div className="w-10 h-10 bg-slate-200 border-2 border-black mx-3" />
                                <span className="font-bold text-black flex-1 uppercase">Student {item}</span>
                                <span className="font-black text-primary font-mono">1,200</span>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
