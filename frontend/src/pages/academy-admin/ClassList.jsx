import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, ChevronRight, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        schedule: '',
        time: '',
        color: 'bg-yellow-200'
    });

    useEffect(() => {
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) {
            setClasses(JSON.parse(savedClasses));
            setLoading(false);
        } else {
            // Simulate API fetch for initial data
            setTimeout(() => {
                const initialClasses = [
                    { id: 1, name: 'Class A', students: 12, schedule: '월, 수, 금', time: '14:00 - 15:30', color: 'bg-yellow-200' },
                    { id: 2, name: 'Class B', students: 8, schedule: '화, 목', time: '16:00 - 17:30', color: 'bg-blue-200' },
                    { id: 3, name: 'Class C', students: 15, schedule: '월, 수, 금', time: '16:00 - 17:30', color: 'bg-green-200' },
                    { id: 4, name: '심화반', students: 5, schedule: '토', time: '10:00 - 13:00', color: 'bg-purple-200' },
                ];
                setClasses(initialClasses);
                localStorage.setItem('classes', JSON.stringify(initialClasses));
                setLoading(false);
            }, 1000);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddClass = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.schedule || !formData.time) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const newClass = {
            id: Date.now(),
            ...formData,
            students: 0
        };

        const updatedClasses = [...classes, newClass];
        setClasses(updatedClasses);
        localStorage.setItem('classes', JSON.stringify(updatedClasses));

        setShowAddModal(false);
        setFormData({
            name: '',
            schedule: '',
            time: '',
            color: 'bg-yellow-200'
        });
        alert('새로운 반이 생성되었습니다.');
    };

    const handleDeleteClass = (e, classId) => {
        e.preventDefault(); // Prevent navigation
        if (window.confirm('정말로 이 반을 삭제하시겠습니까?')) {
            const updatedClasses = classes.filter(c => c.id !== classId);
            setClasses(updatedClasses);
            localStorage.setItem('classes', JSON.stringify(updatedClasses));
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">반 관리</h1>
                    <p className="text-slate-600 font-bold font-mono">수업 일정을 관리하세요</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg"
                >
                    <Plus className="w-5 h-5 mr-2" /> 새 반 만들기
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full text-center p-12 font-bold text-slate-500">반 목록을 불러오는 중...</div>
                ) : (
                    classes.map((cls) => (
                        <Link key={cls.id} to={`/academy-admin/classes/${cls.id}`}>
                            <Card hover className={`flex flex-col h-full border-4 border-black shadow-neo hover:shadow-neo-lg transition-all group bg-white`}>
                                <div className={`p-4 border-b-4 border-black ${cls.color} flex justify-between items-start`}>
                                    <div>
                                        <h3 className="text-2xl font-black text-black uppercase">{cls.name}</h3>
                                        <div className="flex items-center mt-2 font-bold text-black/70">
                                            <Users className="w-4 h-4 mr-2" /> {cls.students}명
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleDeleteClass(e, cls.id)}
                                            className="w-10 h-10 bg-white text-black hover:bg-red-500 hover:text-white flex items-center justify-center border-2 border-black shadow-sm transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
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
                                    <span className="text-xs font-black uppercase text-slate-400">다음 수업</span>
                                    <span className="text-sm font-bold text-black">오늘, 14:00</span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>

            {/* Add Class Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-white border-4 border-black shadow-neo-lg p-0">
                        <div className="p-4 border-b-4 border-black bg-purple-300 flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">새 반 만들기</h3>
                            <button onClick={() => setShowAddModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddClass} className="p-6 space-y-4">
                            <Input
                                label="반 이름"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="예: Class A, 심화반"
                            />
                            <Input
                                label="수업 요일"
                                name="schedule"
                                value={formData.schedule}
                                onChange={handleInputChange}
                                placeholder="예: 월, 수, 금"
                            />
                            <Input
                                label="수업 시간"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                placeholder="예: 14:00 - 15:30"
                            />
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">카드 색상</label>
                                <div className="flex gap-2 mt-2">
                                    {['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-red-200'].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-8 h-8 rounded-full border-2 border-black ${color} ${formData.color === color ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-black text-white hover:bg-slate-800 shadow-neo">
                                    만들기
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClassList;
