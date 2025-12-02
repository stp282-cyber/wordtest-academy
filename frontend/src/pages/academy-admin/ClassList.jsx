import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setClasses([
                { id: 1, name: 'Class A', students: 12, schedule: 'Mon, Wed, Fri', time: '14:00 - 15:30', color: 'bg-yellow-200' },
                { id: 2, name: 'Class B', students: 8, schedule: 'Tue, Thu', time: '16:00 - 17:30', color: 'bg-blue-200' },
                { id: 3, name: 'Class C', students: 15, schedule: 'Mon, Wed, Fri', time: '16:00 - 17:30', color: 'bg-green-200' },
                { id: 4, name: 'Advanced Class', students: 5, schedule: 'Sat', time: '10:00 - 13:00', color: 'bg-purple-200' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">Classes</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage your class schedules</p>
                </div>
                <Button className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg">
                    <Plus className="w-5 h-5 mr-2" /> Create Class
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full text-center p-12 font-bold text-slate-500">Loading classes...</div>
                ) : (
                    classes.map((cls) => (
                        <Link key={cls.id} to={`/academy-admin/classes/${cls.id}`}>
                            <Card hover className={`flex flex-col h-full border-4 border-black shadow-neo hover:shadow-neo-lg transition-all group bg-white`}>
                                <div className={`p-4 border-b-4 border-black ${cls.color} flex justify-between items-start`}>
                                    <div>
                                        <h3 className="text-2xl font-black text-black uppercase">{cls.name}</h3>
                                        <div className="flex items-center mt-2 font-bold text-black/70">
                                            <Users className="w-4 h-4 mr-2" /> {cls.students} Students
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center space-y-3">
                                    <div className="flex items-center text-lg font-bold">
                                        <Calendar className="w-5 h-5 mr-3 text-black" />
                                        <span>{cls.schedule}</span>
                                    </div>
                                    <div className="pl-8 font-mono text-slate-500 font-bold">
                                        {cls.time}
                                    </div>
                                </div>
                                <div className="p-4 border-t-2 border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-slate-400">Next Class</span>
                                    <span className="text-sm font-bold text-black">Today, 14:00</span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClassList;
