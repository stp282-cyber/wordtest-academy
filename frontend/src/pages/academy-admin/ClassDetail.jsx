import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Settings, Plus, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ClassDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setClassData({
                id,
                name: 'Class A',
                schedule: 'Mon, Wed, Fri 14:00',
                students: [
                    { id: 1, name: 'Student 1', progress: 85 },
                    { id: 2, name: 'Student 2', progress: 92 },
                    { id: 3, name: 'Student 3', progress: 78 },
                ],
                curriculum: [
                    { id: 1, title: 'Chapter 1: Basic Greetings', status: 'Completed' },
                    { id: 2, title: 'Chapter 2: Numbers & Colors', status: 'In Progress' },
                    { id: 3, title: 'Chapter 3: Family Members', status: 'Locked' },
                ]
            });
            setLoading(false);
        }, 1000);
    }, [id]);

    if (loading) return <div className="p-12 text-center font-bold">Loading class details...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <Link to="/academy-admin/classes">
                        <Button variant="secondary" className="p-2 border-2 border-black shadow-neo hover:shadow-neo-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-black uppercase italic">{classData.name}</h1>
                        <p className="text-slate-600 font-bold font-mono">{classData.schedule}</p>
                    </div>
                </div>
                <Button className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg border-white">
                    <Settings className="w-5 h-5 mr-2" /> Settings
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b-4 border-black pb-1">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-6 py-2 font-black uppercase border-2 border-black transition-all ${activeTab === 'students' ? 'bg-yellow-300 shadow-neo -translate-y-1' : 'bg-white hover:bg-slate-50'}`}
                >
                    Students
                </button>
                <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`px-6 py-2 font-black uppercase border-2 border-black transition-all ${activeTab === 'curriculum' ? 'bg-blue-300 shadow-neo -translate-y-1' : 'bg-white hover:bg-slate-50'}`}
                >
                    Curriculum
                </button>
            </div>

            {/* Content */}
            <Card className="border-4 border-black shadow-neo-lg bg-white min-h-[400px]">
                {activeTab === 'students' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase text-xl">Enrolled Students</h3>
                            <Button size="sm" className="bg-black text-white hover:bg-slate-800">
                                <Plus className="w-4 h-4 mr-2" /> Add Student
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classData.students.map((student) => (
                                <div key={student.id} className="p-4 border-2 border-black bg-slate-50 hover:bg-yellow-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center mr-3">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-black">{student.name}</div>
                                            <div className="text-xs font-mono text-slate-500">Avg. Score: {student.progress}%</div>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase text-xl">Class Curriculum</h3>
                            <Button size="sm" className="bg-black text-white hover:bg-slate-800">
                                <Plus className="w-4 h-4 mr-2" /> Assign Wordbook
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {classData.curriculum.map((item, index) => (
                                <div key={item.id} className="flex items-center p-4 border-2 border-black bg-white hover:shadow-neo-sm transition-all">
                                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black mr-4 border-2 border-black">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                    </div>
                                    <span className={`
                                        px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm
                                        ${item.status === 'Completed' ? 'bg-green-300' : item.status === 'In Progress' ? 'bg-yellow-300' : 'bg-slate-200'}
                                    `}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ClassDetail;
