import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Settings, Plus, X, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ClassDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);

    // Modals State
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showAddCurriculumModal, setShowAddCurriculumModal] = useState(false);

    // Data for selection
    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableWordbooks, setAvailableWordbooks] = useState([]);

    useEffect(() => {
        // Load Class Data
        const savedClasses = localStorage.getItem('classes');
        const classes = savedClasses ? JSON.parse(savedClasses) : [];
        const currentClass = classes.find(c => c.id.toString() === id);

        // Load Students Data
        const savedStudents = localStorage.getItem('students');
        const allStudents = savedStudents ? JSON.parse(savedStudents) : [];
        setAvailableStudents(allStudents);

        // Load Wordbooks (Mock for now as we haven't implemented Wordbook persistence fully yet)
        setAvailableWordbooks([
            { id: 1, title: 'Chapter 1: Basic Greetings' },
            { id: 2, title: 'Chapter 2: Numbers & Colors' },
            { id: 3, title: 'Chapter 3: Family Members' },
            { id: 4, title: 'Chapter 4: Animals' },
        ]);

        if (currentClass) {
            // Initialize if missing properties
            if (!currentClass.students) currentClass.students = [];
            if (!currentClass.curriculum) currentClass.curriculum = [];

            setClassData(currentClass);
        } else {
            // Fallback for demo if not found in localStorage (e.g. direct link to mock id)
            setClassData({
                id,
                name: 'Class A',
                schedule: '월, 수, 금 14:00',
                students: [],
                curriculum: []
            });
        }
        setLoading(false);
    }, [id]);

    const saveClassData = (updatedClassData) => {
        setClassData(updatedClassData);

        // Update in localStorage classes array
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) {
            const classes = JSON.parse(savedClasses);
            const updatedClasses = classes.map(c => c.id.toString() === id ? updatedClassData : c);
            localStorage.setItem('classes', JSON.stringify(updatedClasses));
        }
    };

    const handleAddStudentToClass = (studentId) => {
        const student = availableStudents.find(s => s.id.toString() === studentId);
        if (student && !classData.students.find(s => s.id === student.id)) {
            const updatedClass = {
                ...classData,
                students: [...classData.students, { ...student, progress: 0 }]
            };
            saveClassData(updatedClass);
            setShowAddStudentModal(false);
            alert('학생이 반에 추가되었습니다.');
        } else if (classData.students.find(s => s.id === student.id)) {
            alert('이미 반에 등록된 학생입니다.');
        }
    };

    const handleRemoveStudent = (studentId) => {
        if (window.confirm('이 학생을 반에서 제외하시겠습니까?')) {
            const updatedClass = {
                ...classData,
                students: classData.students.filter(s => s.id !== studentId)
            };
            saveClassData(updatedClass);
        }
    };

    const handleAddCurriculum = (wordbookId) => {
        const wordbook = availableWordbooks.find(w => w.id.toString() === wordbookId);
        if (wordbook) {
            const newCurriculumItem = {
                id: Date.now(),
                title: wordbook.title,
                status: 'Locked' // Default status
            };
            const updatedClass = {
                ...classData,
                curriculum: [...classData.curriculum, newCurriculumItem]
            };
            saveClassData(updatedClass);
            setShowAddCurriculumModal(false);
            alert('커리큘럼이 추가되었습니다.');
        }
    };

    const handleRemoveCurriculum = (itemId) => {
        if (window.confirm('이 커리큘럼을 삭제하시겠습니까?')) {
            const updatedClass = {
                ...classData,
                curriculum: classData.curriculum.filter(item => item.id !== itemId)
            };
            saveClassData(updatedClass);
        }
    };

    if (loading) return <div className="p-12 text-center font-bold">반 정보를 불러오는 중...</div>;
    if (!classData) return <div className="p-12 text-center font-bold">반을 찾을 수 없습니다.</div>;

    return (
        <div className="space-y-6 relative">
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
                    <Settings className="w-5 h-5 mr-2" /> 설정
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b-4 border-black pb-1">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-6 py-2 font-black uppercase border-2 border-black transition-all ${activeTab === 'students' ? 'bg-yellow-300 shadow-neo -translate-y-1' : 'bg-white hover:bg-slate-50'}`}
                >
                    학생 목록
                </button>
                <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`px-6 py-2 font-black uppercase border-2 border-black transition-all ${activeTab === 'curriculum' ? 'bg-blue-300 shadow-neo -translate-y-1' : 'bg-white hover:bg-slate-50'}`}
                >
                    커리큘럼
                </button>
            </div>

            {/* Content */}
            <Card className="border-4 border-black shadow-neo-lg bg-white min-h-[400px]">
                {activeTab === 'students' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase text-xl">수강생 목록</h3>
                            <Button
                                size="sm"
                                className="bg-black text-white hover:bg-slate-800"
                                onClick={() => setShowAddStudentModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> 학생 추가
                            </Button>
                        </div>
                        {classData.students.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 font-bold">등록된 학생이 없습니다.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {classData.students.map((student) => (
                                    <div key={student.id} className="p-4 border-2 border-black bg-slate-50 hover:bg-yellow-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center mr-3">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-black">{student.name}</div>
                                                <div className="text-xs font-mono text-slate-500">평균 점수: {student.progress || 0}%</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase text-xl">반 커리큘럼</h3>
                            <Button
                                size="sm"
                                className="bg-black text-white hover:bg-slate-800"
                                onClick={() => setShowAddCurriculumModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> 단어장 배정
                            </Button>
                        </div>
                        {classData.curriculum.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 font-bold">등록된 커리큘럼이 없습니다.</div>
                        ) : (
                            <div className="space-y-3">
                                {classData.curriculum.map((item, index) => (
                                    <div key={item.id} className="flex items-center p-4 border-2 border-black bg-white hover:shadow-neo-sm transition-all group">
                                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black mr-4 border-2 border-black">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg">{item.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`
                                                px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm
                                                ${item.status === 'Completed' ? 'bg-green-300' : item.status === 'In Progress' ? 'bg-yellow-300' : 'bg-slate-200'}
                                            `}>
                                                {item.status === 'Completed' ? '완료' : item.status === 'In Progress' ? '진행 중' : '잠김'}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveCurriculum(item.id)}
                                                className="p-1 hover:bg-red-100 border-2 border-transparent hover:border-black transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Add Student Modal */}
            {showAddStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-white border-4 border-black shadow-neo-lg p-0">
                        <div className="p-4 border-b-4 border-black bg-yellow-300 flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">학생 추가</h3>
                            <button onClick={() => setShowAddStudentModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {availableStudents.length === 0 ? (
                                <p className="text-center font-bold text-slate-500">등록 가능한 학생이 없습니다.</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableStudents.map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-3 border-2 border-slate-200 hover:border-black hover:bg-slate-50 transition-all">
                                            <div>
                                                <div className="font-bold">{student.name}</div>
                                                <div className="text-xs text-slate-500">{student.email || 'No Email'}</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddStudentToClass(student.id.toString())}
                                                className="bg-black text-white text-xs"
                                                disabled={classData.students.some(s => s.id === student.id)}
                                            >
                                                {classData.students.some(s => s.id === student.id) ? '등록됨' : '추가'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Curriculum Modal */}
            {showAddCurriculumModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-white border-4 border-black shadow-neo-lg p-0">
                        <div className="p-4 border-b-4 border-black bg-blue-300 flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">단어장 배정</h3>
                            <button onClick={() => setShowAddCurriculumModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {availableWordbooks.map(wb => (
                                    <div key={wb.id} className="flex items-center justify-between p-3 border-2 border-slate-200 hover:border-black hover:bg-slate-50 transition-all">
                                        <div className="font-bold">{wb.title}</div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddCurriculum(wb.id.toString())}
                                            className="bg-black text-white text-xs"
                                        >
                                            추가
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClassDetail;
