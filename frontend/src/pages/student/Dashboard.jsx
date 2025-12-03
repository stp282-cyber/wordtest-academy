import React, { useEffect, useState } from 'react';
import { BookOpen, Trophy, Target, Clock, ArrowUpRight, Bell, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getTodaySchedule, getIncompleteLessons } from '../../utils/scheduleUtils';

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
    const [incompleteLessons, setIncompleteLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) return;

                // 1. Calculate Stats from LocalStorage
                const historyKey = `learning_history_${user.id}`;
                const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

                const totalTests = history.length;
                const totalScore = history.reduce((acc, curr) => acc + (curr.mainScore || 0), 0);
                const avgScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

                // Estimate words learned: assuming ~20 words per test on average if not trackable
                // Or better, if we can't easily get word count, just use a multiplier
                const wordsLearned = totalTests * 20;

                // Estimate study time: 15 mins per test
                const studyMinutes = totalTests * 15;
                const studyTime = studyMinutes < 60 ? `${studyMinutes}m` : `${(studyMinutes / 60).toFixed(1)}h`;

                setStats({
                    wordsLearned: wordsLearned,
                    totalPoints: totalScore * 10, // 10 points per score
                    accuracy: `${avgScore}%`,
                    studyTime: studyTime
                });

                // 2. Fetch Incomplete Lessons
                const curriculumKey = `curriculums_${user.id}`;
                const curriculums = JSON.parse(localStorage.getItem(curriculumKey) || '[]');
                const incomplete = getIncompleteLessons(user, curriculums, history);
                setIncompleteLessons(incomplete);

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Calculate Leaderboard (Memoized or inside render if small)
    const getLeaderboard = () => {
        const leaderboard = [];
        // Scan all keys in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('learning_history_')) {
                const userId = key.replace('learning_history_', '');
                const history = JSON.parse(localStorage.getItem(key) || '[]');
                const totalScore = history.reduce((acc, curr) => acc + (curr.mainScore || 0), 0) * 10;

                // Try to find user name
                // We might not have access to all users' names easily if they are not stored centrally
                // But we can check 'users' key if it exists (admin usually has it)
                // Or just use "Student {ID}"
                let name = `Student ${userId.substr(0, 4)}`;
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const foundUser = users.find(u => u.id === userId);
                if (foundUser) name = foundUser.full_name || foundUser.username;

                if (history.length > 0) {
                    leaderboard.push({ id: userId, name, score: totalScore });
                }
            }
        }

        // Sort by score desc
        return leaderboard.sort((a, b) => b.score - a.score).slice(0, 5);
    };

    const leaderboardData = getLeaderboard();

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

            {/* Incomplete Lessons Alert */}
            {incompleteLessons.length > 0 && (
                <div className="bg-red-50 border-4 border-red-500 p-6 shadow-neo-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 border-l-4 border-b-4 border-black font-black uppercase text-sm z-10">
                        Action Required
                    </div>
                    <h2 className="text-2xl font-black text-red-600 uppercase mb-4 flex items-center">
                        <AlertTriangle className="w-8 h-8 mr-2" /> 미완료 학습 ({incompleteLessons.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {incompleteLessons.map((item, index) => (
                            <div key={index} className="bg-white border-2 border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-red-100 text-red-800 px-2 py-0.5 text-xs font-bold uppercase rounded">{item.date}</span>
                                    <span className="text-xs font-mono font-bold text-slate-500">{item.curriculumTitle}</span>
                                </div>
                                <h4 className="font-black text-lg text-black mb-1">
                                    {item.schedule.unitName || `${item.schedule.unit} ${item.schedule.subUnit}`}
                                </h4>
                                <Button
                                    size="sm"
                                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white border-black"
                                    onClick={() => window.location.href = '/student/learning'}
                                >
                                    Catch Up Now
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notice Board */}
            <div className="bg-white border-4 border-black p-6 shadow-neo-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-300 px-4 py-1 border-l-4 border-b-4 border-black font-black uppercase text-sm z-10">
                    Notice Board
                </div>
                <h2 className="text-2xl font-black text-black uppercase mb-4 flex items-center">
                    <Bell className="w-6 h-6 mr-2" /> 공지사항
                </h2>
                <div className="space-y-3">
                    <div className="p-4 border-2 border-black bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase">Important</span>
                            <span className="text-xs font-mono font-bold text-slate-500">2024-06-20</span>
                        </div>
                        <h3 className="font-black text-lg mb-1">여름방학 특강 안내</h3>
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">
                            여름방학을 맞아 문법 특강을 진행합니다. 많은 참여 바랍니다. 자세한 내용은...
                        </p>
                    </div>
                    <div className="p-4 border-2 border-black bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-slate-200 text-black px-2 py-0.5 text-xs font-bold uppercase">Class A</span>
                            <span className="text-xs font-mono font-bold text-slate-500">2024-06-21</span>
                        </div>
                        <h3 className="font-black text-lg mb-1">중등반 단어 시험 일정 변경</h3>
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">
                            다음 주 단어 시험이 월요일에서 화요일로 변경되었습니다. 착오 없으시길 바랍니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Today's Lessons</h2>
                    <div className="space-y-4">
                        {(() => {
                            // Get today's schedule
                            const todaySchedule = getTodaySchedule(user?.id);

                            if (todaySchedule.length === 0) {
                                return (
                                    <div className="neo-card p-8 text-center">
                                        <p className="text-slate-500 font-bold">오늘은 학습 일정이 없습니다.</p>
                                        <p className="text-sm text-slate-400 mt-2">편안한 하루 보내세요! 😊</p>
                                    </div>
                                );
                            }

                            return todaySchedule.map((item, index) => (
                                <div key={index} className="neo-card flex items-center p-4 hover:bg-yellow-50 transition-colors cursor-pointer group relative">
                                    <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent group-hover:border-black pointer-events-none transition-all" />

                                    <div className="w-12 h-12 bg-black text-white border-2 border-black flex items-center justify-center font-black text-xl mr-4 shadow-neo-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-lg text-black uppercase">{item.schedule.textbook}</h4>
                                        <div className="flex gap-4 text-sm font-bold text-slate-600 mt-1">
                                            <span>대단원: {item.schedule.major}</span>
                                            <span>소단원: {item.schedule.minor}</span>
                                        </div>
                                        <p className="text-sm font-mono font-bold text-blue-600 mt-1">
                                            진도: {item.schedule.wordRange} ({item.schedule.wordCount}개 단어)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Button
                                            size="sm"
                                            className="bg-green-400 hover:bg-green-500 border-black shadow-neo-sm"
                                            onClick={() => window.location.href = `/student/test?curriculum=${item.curriculum.id}`}
                                        >
                                            시험 시작
                                        </Button>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Leaderboard</h2>
                    <Card className="p-0 overflow-hidden bg-white">
                        {leaderboardData.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-bold">
                                No records yet. Be the first!
                            </div>
                        ) : (
                            leaderboardData.map((item, index) => (
                                <div key={item.id} className="flex items-center px-6 py-4 border-b-2 border-black last:border-0 hover:bg-slate-50 transition-colors">
                                    <span className={`w-8 font-black text-xl ${index < 3 ? 'text-accent' : 'text-slate-400'}`}>#{index + 1}</span>
                                    <div className="w-10 h-10 bg-slate-200 border-2 border-black mx-3 flex items-center justify-center font-bold text-xs overflow-hidden">
                                        {item.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-black flex-1 uppercase truncate pr-2">{item.name}</span>
                                    <span className="font-black text-primary font-mono">{item.score.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
