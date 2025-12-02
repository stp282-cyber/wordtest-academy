import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CheckSquare, X, Save, ChevronLeft, ChevronRight, BarChart2, FileText, Clock, Copy, Clipboard, Users, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';



// Mock Data for Learning Records
const MOCK_RECORDS = [
    { id: 1, academy: '이스턴영어', studentId: 'std001', className: '초등A반', name: '김철수', curriculum: '기초영어(Chapter1+Unit1+인사하기)', attempt: 1, range: 'Hello~Nice', score1: 80, totalScore: 100, time: '10:00', date: '2024-12-01', status: '완료' },
    { id: 2, academy: '이스턴영어', studentId: 'std001', className: '초등A반', name: '김철수', curriculum: '기초영어(Chapter1+Unit2+소개하기)', attempt: 2, range: 'Name~Meet', score1: 90, totalScore: 100, time: '12:00', date: '2024-12-02', status: '완료' },
];

// Mock Data for Daily Management (Incomplete Items)
const MOCK_INCOMPLETE = [
    { id: 1, date: '2024-12-01', area: '단어', unit: 'Chapter 1', status: '미완료' },
    { id: 2, date: '2024-12-02', area: '문법', unit: 'Unit 2', status: '미완료' },
    { id: 3, date: '2024-12-03', area: '독해', unit: 'Chapter 3', status: '진행중' },
];

import ClassLogModal from '../../components/academy-admin/ClassLogModal';

const LearningRecordModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-neo-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase">학습기록 - {student.name} ({student.studentId})</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-slate-50 p-4 border-2 border-black mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input placeholder="검색어 입력" icon={Search} />
                    <div className="flex items-center gap-2">
                        <input type="date" className="w-full p-2 border-2 border-black font-bold" />
                        <span className="font-black">~</span>
                        <input type="date" className="w-full p-2 border-2 border-black font-bold" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 font-bold">
                            <input type="checkbox" className="w-5 h-5 border-2 border-black" /> 단어
                        </label>
                        <label className="flex items-center gap-2 font-bold">
                            <input type="checkbox" className="w-5 h-5 border-2 border-black" /> 문법
                        </label>
                    </div>
                    <Button className="bg-black text-white hover:bg-slate-800 shadow-neo">검색</Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border-2 border-black">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-sm font-black uppercase border-b-2 border-black">
                                <th className="p-3 border-r-2 border-black w-12 text-center">No</th>
                                <th className="p-3 border-r-2 border-black">학원명</th>
                                <th className="p-3 border-r-2 border-black">아이디</th>
                                <th className="p-3 border-r-2 border-black">반</th>
                                <th className="p-3 border-r-2 border-black">이름</th>
                                <th className="p-3 border-r-2 border-black">커리큘럼명</th>
                                <th className="p-3 border-r-2 border-black text-center">회차</th>
                                <th className="p-3 border-r-2 border-black">범위</th>
                                <th className="p-3 border-r-2 border-black text-center">점수</th>
                                <th className="p-3 border-r-2 border-black text-center">진행시간</th>
                                <th className="p-3 border-r-2 border-black text-center">응시일자</th>
                                <th className="p-3 text-center">완료여부</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold">
                            {MOCK_RECORDS.map((record, index) => (
                                <tr key={record.id} className="border-b border-black hover:bg-yellow-50">
                                    <td className="p-3 border-r border-black text-center">{index + 1}</td>
                                    <td className="p-3 border-r border-black">{record.academy}</td>
                                    <td className="p-3 border-r border-black">{record.studentId}</td>
                                    <td className="p-3 border-r border-black">{record.className}</td>
                                    <td className="p-3 border-r border-black">{record.name}</td>
                                    <td className="p-3 border-r border-black">{record.curriculum}</td>
                                    <td className="p-3 border-r border-black text-center">{record.attempt}</td>
                                    <td className="p-3 border-r border-black">{record.range}</td>
                                    <td className="p-3 border-r border-black text-center">{record.score1} / {record.totalScore}</td>
                                    <td className="p-3 border-r border-black text-center">{record.time}</td>
                                    <td className="p-3 border-r border-black text-center">{record.date}</td>
                                    <td className="p-3 text-center">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{record.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DailyManagementModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    const [items, setItems] = useState(MOCK_INCOMPLETE);
    const [selectedItems, setSelectedItems] = useState([]);

    const toggleSelect = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = () => {
        setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        alert('선택한 항목이 삭제되었습니다.');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-neo-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase">당일관리 - 미완료 학습 현황</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Student Info Header */}
                <div className="bg-yellow-100 border-2 border-black p-4 mb-6 flex flex-wrap gap-6 font-bold">
                    <div><span className="text-slate-500 mr-2">학원명:</span>이스턴영어</div>
                    <div><span className="text-slate-500 mr-2">회원구분:</span>학생</div>
                    <div><span className="text-slate-500 mr-2">아이디:</span>{student.studentId}</div>
                    <div><span className="text-slate-500 mr-2">이름:</span>{student.name}</div>
                    <div><span className="text-slate-500 mr-2">반:</span>{student.className}</div>
                </div>

                {/* Incomplete Items Table */}
                <div className="mb-4">
                    <h3 className="font-black text-lg mb-2">미완료 항목 전체 조회 (이전 ~ 오늘)</h3>
                    <div className="overflow-x-auto border-2 border-black">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-sm font-black uppercase border-b-2 border-black">
                                    <th className="p-3 border-r-2 border-black">예상완료날짜</th>
                                    <th className="p-3 border-r-2 border-black">미완료항목 영역</th>
                                    <th className="p-3 border-r-2 border-black">단원명</th>
                                    <th className="p-3 border-r-2 border-black text-center">학습완료유무</th>
                                    <th className="p-3 text-center">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-bold">
                                {items.length === 0 ? (
                                    <tr><td colSpan="5" className="p-4 text-center">미완료 항목이 없습니다.</td></tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="border-b border-black hover:bg-red-50">
                                            <td className="p-3 border-r border-black">{item.date}</td>
                                            <td className="p-3 border-r border-black">{item.area}</td>
                                            <td className="p-3 border-r border-black">{item.unit}</td>
                                            <td className="p-3 border-r border-black text-center text-red-600">{item.status}</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="w-5 h-5 border-2 border-black cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600 shadow-neo border-black" disabled={selectedItems.length === 0}>
                        <Save className="w-5 h-5 mr-2" /> 선택 항목 삭제 (저장)
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ProgressManagement = () => {
    const [students, setStudents] = useState([]);
    const [filterClass, setFilterClass] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
    const [isClassLogModalOpen, setIsClassLogModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Load students from localStorage
    useEffect(() => {
        loadStudents();

        // Listen for storage changes from other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'students') {
                loadStudents();
            }
        };

        // Listen for custom events from same tab
        const handleLocalUpdate = () => {
            loadStudents();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('localStorageUpdated', handleLocalUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorageUpdated', handleLocalUpdate);
        };
    }, []);

    const loadStudents = () => {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            try {
                const parsed = JSON.parse(savedStudents);
                setStudents(parsed);
            } catch (e) {
                console.error('Failed to parse students:', e);
                setStudents([]);
            }
        } else {
            setStudents([]);
        }
    };

    // Curriculum Management Handlers
    const handleCopyCurriculum = () => {
        if (selectedStudentIds.length === 0) {
            alert('복사할 학생을 선택해주세요.');
            return;
        }
        if (selectedStudentIds.length > 1) {
            alert('한 명의 학생만 선택해주세요.');
            return;
        }
        const student = students.find(s => s.id === selectedStudentIds[0]);
        const curriculumKey = `curriculums_${student.id}`;
        const curriculums = localStorage.getItem(curriculumKey);

        if (!curriculums || curriculums === '[]') {
            alert('복사할 커리큘럼이 없습니다.');
            return;
        }

        localStorage.setItem('copied_curriculum', curriculums);
        alert('커리큘럼이 복사되었습니다.');
    };

    const handlePasteCurriculum = () => {
        if (selectedStudentIds.length === 0) {
            alert('붙여넣기할 학생을 선택해주세요.');
            return;
        }

        const copiedData = localStorage.getItem('copied_curriculum');
        if (!copiedData) {
            alert('복사된 커리큘럼이 없습니다.');
            return;
        }

        selectedStudentIds.forEach(studentId => {
            const curriculumKey = `curriculums_${studentId}`;
            localStorage.setItem(curriculumKey, copiedData);
        });

        alert(`${selectedStudentIds.length}명의 학생에게 커리큘럼이 붙여넣기 되었습니다.`);
    };

    const handleBulkRegister = () => {
        alert('대량 등록 기능은 준비 중입니다.');
    };

    const handleNewCurriculum = () => {
        if (selectedStudentIds.length === 0) {
            alert('커리큘럼을 등록할 학생을 선택해주세요.');
            return;
        }
        if (selectedStudentIds.length > 1) {
            alert('한 명의 학생만 선택해주세요.');
            return;
        }
        const student = students.find(s => s.id === selectedStudentIds[0]);
        openClassLogModal(student);
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass === 'All' || student.className === filterClass;
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesClass && matchesSearch;
    });

    const uniqueClasses = ['All', ...new Set(students.map(s => s.className).filter(Boolean))];

    const openRecordModal = (student) => {
        // Reload latest student data
        const latestStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const latestStudent = latestStudents.find(s => s.id === student.id) || student;
        setSelectedStudent(latestStudent);
        setIsRecordModalOpen(true);
    };

    const openDailyModal = (student) => {
        const latestStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const latestStudent = latestStudents.find(s => s.id === student.id) || student;
        setSelectedStudent(latestStudent);
        setIsDailyModalOpen(true);
    };

    const openClassLogModal = (student) => {
        const latestStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const latestStudent = latestStudents.find(s => s.id === student.id) || student;
        setSelectedStudent(latestStudent);
        setIsClassLogModalOpen(true);
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const toggleSelectStudent = (id) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">진도 관리</h1>
                    <p className="text-slate-600 font-bold font-mono">학생들의 학습 현황을 확인하고 관리하세요</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handleCopyCurriculum}
                        className="bg-blue-500 text-white hover:bg-blue-600 border-black shadow-neo flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        복사
                    </Button>
                    <Button
                        onClick={handlePasteCurriculum}
                        className="bg-blue-500 text-white hover:bg-blue-600 border-black shadow-neo flex items-center gap-2"
                    >
                        <Clipboard className="w-4 h-4" />
                        붙여넣기
                    </Button>
                    <Button
                        onClick={handleBulkRegister}
                        className="bg-purple-500 text-white hover:bg-purple-600 border-black shadow-neo flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        대량 등록
                    </Button>
                    <Button
                        onClick={handleNewCurriculum}
                        className="bg-green-500 text-white hover:bg-green-600 border-black shadow-neo flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        새 커리큘럼 등록
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <Card className="border-4 border-black shadow-neo bg-white p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="p-2 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm h-10"
                        >
                            {uniqueClasses.map(cls => (
                                <option key={cls} value={cls}>{cls === 'All' ? '전체 반' : cls}</option>
                            ))}
                        </select>
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="이름/아이디 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm h-10"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                    <div className="font-bold text-lg">
                        총 학생수: <span className="text-blue-600 font-black text-xl">{filteredStudents.length}</span>명
                    </div>
                </div>
            </Card>

            {/* Student List Table */}
            <Card className="border-4 border-black shadow-neo-lg bg-white p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white uppercase text-sm font-black">
                                <th className="p-3 w-12 text-center">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`w-8 h-8 border-2 border-white font-black text-xs transition-all ${filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length
                                                ? 'bg-green-300 text-black'
                                                : 'bg-transparent text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length ? '✓' : ''}
                                    </button>
                                </th>
                                <th className="p-3 border-r-2 border-white w-16 text-center">No.</th>
                                <th className="p-3 border-r-2 border-white w-24 text-center">반</th>
                                <th className="p-3 border-r-2 border-white w-32">아이디(이름)</th>
                                <th className="p-3 border-r-2 border-white text-center">커리큘럼 등록 현황</th>
                                <th className="p-3 border-r-2 border-white text-center">학습평가</th>
                                <th className="p-3 border-r-2 border-white text-center">당일관리</th>
                                <th className="p-3 text-center">주별 진행률</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold text-black text-sm">
                            {filteredStudents.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-500">학생이 없습니다.</td></tr>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="border-b-2 border-black hover:bg-yellow-50 transition-colors">
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => toggleSelectStudent(student.id)}
                                                className={`w-10 h-10 border-3 border-black font-black text-sm transition-all ${selectedStudentIds.includes(student.id)
                                                    ? 'bg-green-300 shadow-neo'
                                                    : 'bg-white hover:bg-slate-100'
                                                    }`}
                                            >
                                                {selectedStudentIds.includes(student.id) ? '✓' : ''}
                                            </button>
                                        </td>
                                        <td className="p-3 border-r-2 border-black text-center font-mono">{index + 1}</td>
                                        <td className="p-3 border-r-2 border-black text-center">
                                            <span className="inline-block bg-yellow-300 text-black px-3 py-1 text-xs font-black border-2 border-black shadow-sm">
                                                {student.className || '미배정'}
                                            </span>
                                        </td>
                                        <td className="p-3 border-r-2 border-black">
                                            <div>{student.studentId}</div>
                                            <div className="text-xs text-slate-500">({student.name})</div>
                                        </td>
                                        <td className="p-3 border-r-2 border-black text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openClassLogModal(student)}
                                                    className={`text-xs px-2 py-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all ${student.curriculumStatus === '등록완료' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}
                                                >
                                                    {student.curriculumStatus}
                                                </button>
                                                {student.curriculumName && student.curriculumName !== '-' && (
                                                    <button
                                                        onClick={() => openClassLogModal(student)}
                                                        className="text-sm font-black underline decoration-2 decoration-blue-200 hover:text-blue-600"
                                                    >
                                                        {student.curriculumName}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 border-r-2 border-black text-center">
                                            <button
                                                onClick={() => openRecordModal(student)}
                                                className="text-blue-600 hover:underline flex items-center justify-center w-full gap-1"
                                            >
                                                <BarChart2 className="w-4 h-4" /> 학습기록
                                            </button>
                                        </td>
                                        <td className="p-3 border-r-2 border-black text-center">
                                            <button
                                                onClick={() => openDailyModal(student)}
                                                className="text-red-600 hover:underline flex items-center justify-center w-full gap-1"
                                            >
                                                <Clock className="w-4 h-4" /> 미완료 확인
                                            </button>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-24 h-3 bg-slate-200 rounded-full border border-black overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-400"
                                                        style={{ width: `${student.weeklyProgress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-mono">{student.weeklyProgress}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modals */}
            <LearningRecordModal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                student={selectedStudent}
            />
            <DailyManagementModal
                isOpen={isDailyModalOpen}
                onClose={() => setIsDailyModalOpen(false)}
                student={selectedStudent}
            />
            <ClassLogModal
                isOpen={isClassLogModalOpen}
                onClose={() => setIsClassLogModalOpen(false)}
                student={selectedStudent}
            />
        </div>
    );
};

export default ProgressManagement;
