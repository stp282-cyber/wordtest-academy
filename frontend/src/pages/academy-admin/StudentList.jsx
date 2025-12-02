import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, User, Filter, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        name: '',
        email: '',
        className: '',
        status: 'Active'
    });

    const [availableClasses, setAvailableClasses] = useState([]);

    // Load students and classes
    useEffect(() => {
        loadStudents();
        loadClasses();

        // Listen for storage changes from other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'students') {
                loadStudents();
            } else if (e.key === 'classes') {
                loadClasses();
            }
        };

        // Listen for custom events from same tab
        const handleLocalUpdate = () => {
            loadStudents();
            loadClasses();
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
            const parsed = JSON.parse(savedStudents);
            // Migrate old data structure if needed
            const migrated = parsed.map(s => ({
                ...s,
                studentId: s.studentId || s.id || `std${s.id}`,
                className: s.className || s.class || '미배정',
                curriculumStatus: s.curriculumStatus || '미등록',
                curriculumName: s.curriculumName || '-',
                weeklyProgress: s.weeklyProgress || s.progress || 0
            }));
            setStudents(migrated);
            // Save migrated data
            localStorage.setItem('students', JSON.stringify(migrated));
            setLoading(false);
        } else {
            setStudents([]);
            setLoading(false);
        }
    };

    const loadClasses = () => {
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) {
            try {
                const parsed = JSON.parse(savedClasses);
                const validClasses = parsed.filter(c => c && c.name && c.schedule);
                setAvailableClasses(validClasses);
            } catch (e) {
                console.error('Failed to parse classes:', e);
                setAvailableClasses([]);
            }
        } else {
            setAvailableClasses([]);
        }
    };

    // Extract unique classes for filter
    const classes = ['All', ...new Set(students.map(s => s.className).filter(Boolean))];

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesClass = selectedClass === 'All' || student.className === selectedClass;
        return matchesSearch && matchesClass;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddStudent = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.id || !formData.password || !formData.name) {
            alert('아이디, 비밀번호, 이름은 필수 입력 사항입니다.');
            return;
        }

        let updatedStudents;

        if (isEditing) {
            updatedStudents = students.map(student =>
                student.id === editingId ? {
                    ...student,
                    studentId: formData.id,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    className: formData.className,
                    status: formData.status
                } : student
            );
            alert('학생 정보가 수정되었습니다.');
        } else {
            const newStudent = {
                id: Date.now(),
                studentId: formData.id,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                className: formData.className,
                status: formData.status,
                progress: 0,
                curriculumStatus: '미등록',
                curriculumName: '-',
                weeklyProgress: 0
            };
            updatedStudents = [...students, newStudent];
            alert('학생이 추가되었습니다.');
        }

        setStudents(updatedStudents);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
        window.dispatchEvent(new Event('localStorageUpdated'));

        closeModal();
    };

    const handleDeleteStudent = (id) => {
        if (window.confirm('정말 이 학생을 삭제하시겠습니까?')) {
            const updatedStudents = students.filter(student => student.id !== id);
            setStudents(updatedStudents);
            localStorage.setItem('students', JSON.stringify(updatedStudents));
            window.dispatchEvent(new Event('localStorageUpdated'));
        }
    };

    const handleEditClick = (student) => {
        setFormData({
            id: student.studentId || student.id,
            password: student.password || '',
            name: student.name,
            email: student.email || '',
            className: student.className || '',
            status: student.status
        });
        setEditingId(student.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            id: '',
            password: '',
            name: '',
            email: '',
            className: availableClasses.length > 0 ? availableClasses[0].name : '',
            status: 'Active'
        });
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">학생 관리</h1>
                    <p className="text-slate-600 font-bold font-mono">학원 수강생 목록입니다</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg"
                >
                    <Plus className="w-5 h-5 mr-2" /> 학생 추가
                </Button>
            </div>

            <Card className="border-4 border-black shadow-neo-lg p-0 overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="p-4 border-b-4 border-black bg-yellow-300 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                        <input
                            type="text"
                            placeholder="학생 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm placeholder-slate-500"
                        />
                    </div>

                    {/* Class Filter */}
                    <div className="relative w-full md:w-auto">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-8 py-2 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm appearance-none bg-white cursor-pointer"
                        >
                            {classes.map(cls => (
                                <option key={cls} value={cls}>
                                    {cls === 'All' ? '전체 반' : cls}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 fill-current text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white uppercase text-sm font-black">
                                <th className="p-4 border-r-2 border-white">이름</th>
                                <th className="p-4 border-r-2 border-white">반</th>
                                <th className="p-4 border-r-2 border-white">진도율</th>
                                <th className="p-4 border-r-2 border-white">상태</th>
                                <th className="p-4">관리</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold text-black">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">학생 목록을 불러오는 중...</td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">검색된 학생이 없습니다.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b-2 border-black hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 border-r-2 border-black">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-200 border-2 border-black rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-black">{student.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{student.email || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-black font-mono">{student.className || '미배정'}</td>
                                        <td className="p-4 border-r-2 border-black">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-3 bg-slate-200 border-2 border-black rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-400 border-r-2 border-black"
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-black">
                                            <span className={`
                                                inline-block px-2 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm
                                                ${student.status === 'Active' ? 'bg-green-300' : 'bg-red-300'}
                                            `}>
                                                {student.status === 'Active' ? '활동중' : '비활성'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(student)}
                                                    className="p-1 hover:bg-yellow-200 border-2 border-transparent hover:border-black transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="p-1 hover:bg-red-200 border-2 border-transparent hover:border-black transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-white border-4 border-black shadow-neo-lg p-0">
                        <div className="p-4 border-b-4 border-black bg-blue-300 flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">{isEditing ? '학생 정보 수정' : '학생 추가'}</h3>
                            <button onClick={closeModal}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                            <Input
                                label="아이디"
                                name="id"
                                value={formData.id}
                                onChange={handleInputChange}
                                placeholder="학생 아이디"
                            />
                            <Input
                                label="비밀번호"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="초기 비밀번호"
                            />
                            <Input
                                label="이름"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="학생 이름"
                            />
                            <Input
                                label="이메일 (선택)"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="student@example.com"
                            />
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">반 배정</label>
                                <select
                                    name="className"
                                    value={formData.className}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm"
                                >
                                    <option value="">미배정</option>
                                    {availableClasses.map(cls => (
                                        <option key={cls.id} value={cls.name}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">상태</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm"
                                >
                                    <option value="Active">정상 이용</option>
                                    <option value="Inactive">휴원</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-black text-white hover:bg-slate-800 shadow-neo">
                                    {isEditing ? '수정하기' : '추가하기'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StudentList;
