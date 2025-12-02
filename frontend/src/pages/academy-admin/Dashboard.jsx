import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import client from '../../api/client';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className={`flex items-center p-5 border-2 border-black shadow-neo ${color}`}>
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
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeClasses: 0,
        wordbooks: 0,
        avgScore: '0%'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we would have specific endpoints for these counts.
                // For this verification phase with Mock DB, we'll fetch lists or use the analytics endpoint.
                // Let's use the /api/analytics/academy endpoint we saw earlier.
                const analyticsRes = await client.get('/analytics/academy');
                const classPerformance = analyticsRes.data; // [{ CLASS_NAME, AVG_SCORE }]

                // Mocking other stats since we don't have dedicated count endpoints ready in this turn
                // In a full implementation, we'd add /api/dashboard/stats
                const totalAvg = classPerformance.reduce((acc, curr) => acc + curr.AVG_SCORE, 0) / (classPerformance.length || 1);

                setStats({
                    totalStudents: 12, // Mock
                    activeClasses: classPerformance.length,
                    wordbooks: 5, // Mock
                    avgScore: `${Math.round(totalAvg)}%`
                });
            } catch (error) {
                console.error('Failed to fetch academy dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center font-bold">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-6 shadow-neo-lg">
                <div>
                    <h1 className="text-4xl font-black text-black mb-1 uppercase italic">Academy Dashboard</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage your students and curriculum</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-2 border-black shadow-neo hover:shadow-neo-lg">
                        Manage Students
                    </Button>
                    <Button className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white">
                        <Plus className="w-5 h-5 mr-2" /> New Class
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="bg-blue-200" />
                <StatCard icon={GraduationCap} label="Active Classes" value={stats.activeClasses} color="bg-purple-200" />
                <StatCard icon={BookOpen} label="Wordbooks" value={stats.wordbooks} color="bg-yellow-200" />
                <StatCard icon={TrendingUp} label="Avg Score" value={stats.avgScore} color="bg-green-200" />
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Recent Test Results</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="neo-card flex items-center p-4 hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 bg-slate-200 border-2 border-black flex items-center justify-center font-bold mr-4">
                                    S{item}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-black uppercase">Student {item}</h4>
                                    <p className="text-sm font-bold text-slate-500 font-mono">Class A • Wordbook 1</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-1 border-2 border-black text-xs font-black uppercase shadow-neo-sm ${item % 2 === 0 ? 'bg-green-400' : 'bg-yellow-400'}`}>
                                        {item % 2 === 0 ? '95/100' : '82/100'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" className="h-32 flex flex-col items-center justify-center border-2 border-black shadow-neo hover:bg-blue-50">
                            <Users className="w-8 h-8 mb-2" />
                            Add Student
                        </Button>
                        <Button variant="secondary" className="h-32 flex flex-col items-center justify-center border-2 border-black shadow-neo hover:bg-green-50">
                            <BookOpen className="w-8 h-8 mb-2" />
                            Upload Wordbook
                        </Button>
                        <Button variant="secondary" className="h-32 flex flex-col items-center justify-center border-2 border-black shadow-neo hover:bg-yellow-50">
                            <TrendingUp className="w-8 h-8 mb-2" />
                            View Reports
                        </Button>
                        <Button variant="secondary" className="h-32 flex flex-col items-center justify-center border-2 border-black shadow-neo hover:bg-purple-50">
                            <GraduationCap className="w-8 h-8 mb-2" />
                            Manage Curriculum
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
