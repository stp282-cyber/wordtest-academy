import React, { useState, useEffect } from 'react';
import { X, Save, Search, Copy, Clipboard } from 'lucide-react';
import Button from '../common/Button';

const AddCurriculumModal = ({ isOpen, onClose, onRegister, student }) => {
    if (!isOpen || !student) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [availableCurriculums, setAvailableCurriculums] = useState([]);

    // Load wordbooks from API
    useEffect(() => {
        const loadWordbooks = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Loading wordbooks, token:', token ? 'exists' : 'missing');

                const response = await fetch('http://localhost:3000/api/wordbooks/academy', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Wordbooks response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Loaded wordbooks:', data);

                    setAvailableCurriculums(data.map(wb => ({
                        id: wb.id,
                        title: wb.title,
                        wordbooks: [wb.title]
                    })));
                } else {
                    console.error('Failed to load wordbooks, status:', response.status);
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                }
            } catch (error) {
                console.error('Failed to load wordbooks:', error);
                // Fallback: Use mock data when API is not available
                console.log('Using mock data as fallback');
                setAvailableCurriculums([
                    { id: 1, title: 'STANDARD BEGINNER COURSE', wordbooks: ['Chapter 1', 'Chapter 2', 'Chapter 3'] },
                    { id: 2, title: 'TEST', wordbooks: ['Test Unit 1', 'Test Unit 2'] },
                    { id: 3, title: '새커리큘럼', wordbooks: ['Unit 1'] },
                    { id: 4, title: '새 커리큘럼1', wordbooks: ['Unit 1', 'Unit 2', 'Unit 3'] },
                ]);
            }
        };
        if (isOpen) {
            loadWordbooks();
        }
    }, [isOpen]);

    const weekDays = [
        { id: 'mon', label: '월', color: 'blue' },
        { id: 'tue', label: '화', color: 'blue' },
        { id: 'wed', label: '수', color: 'blue' },
        { id: 'thu', label: '목', color: 'blue' },
        { id: 'fri', label: '금', color: 'blue' },
    ];

    // 검색 필터링
    const filteredCurriculums = availableCurriculums.filter(curr =>
        curr.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDay = (dayId) => {
        setSelectedDays(prev =>
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    const handleRegister = () => {
        if (!selectedCurriculum) {
            alert('커리큘럼을 선택해주세요.');
            return;
        }
        if (selectedDays.length === 0) {
            alert('학습 요일을 선택해주세요.');
            return;
        }
        if (!startDate) {
            alert('시작일을 선택해주세요.');
            return;
        }

        // 객체 형태로 커리큘럼 데이터 전달
        const curriculumData = {
            curriculumId: selectedCurriculum.id,
            title: selectedCurriculum.title,
            days: selectedDays,
            startDate: startDate,
            wordbooks: selectedCurriculum.wordbooks
        };

        onRegister(curriculumData);
        handleReset();
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedCurriculum(null);
        setSelectedDays([]);
        setStartDate('');
        setShowDropdown(false);
    };

    const handleCopy = () => {
        if (!selectedCurriculum || selectedDays.length === 0 || !startDate) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        const copyData = {
            curriculumId: selectedCurriculum.id,
            title: selectedCurriculum.title,
            days: selectedDays,
            startDate: startDate
        };

        localStorage.setItem('copiedCurriculum', JSON.stringify(copyData));
        alert('커리큘럼 정보가 복사되었습니다.');
    };

    const handlePaste = () => {
        const copiedData = localStorage.getItem('copiedCurriculum');
        if (!copiedData) {
            alert('복사된 커리큘럼이 없습니다.');
            return;
        }

        const data = JSON.parse(copiedData);
        const curriculum = availableCurriculums.find(c => c.id === data.curriculumId);

        if (curriculum) {
            setSelectedCurriculum(curriculum);
            setSelectedDays(data.days);
            setStartDate(data.startDate);
            alert('커리큘럼 정보가 붙여넣기 되었습니다.');
        } else {
            alert('해당 커리큘럼을 찾을 수 없습니다.');
        }
    };

    const handleBulkRegister = () => {
        if (!selectedCurriculum || selectedDays.length === 0 || !startDate) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        // 대량 등록 로직 (추후 구현)
        alert('대량 등록 기능은 추후 구현 예정입니다.');
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-neo-lg flex flex-col">
                {/* Header */}
                <div className="p-4 border-b-4 border-black bg-yellow-300 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="font-display font-black uppercase text-2xl tracking-tight">커리큘럼 등록</h3>
                        <p className="text-sm font-bold mt-1">{student.name} ({student.studentId})</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* 커리큘럼 선택 */}
                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase bg-black text-white px-3 py-1 inline-block">
                            1. 커리큘럼 선택
                        </label>

                        {/* 검색 입력 */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="커리큘럼 검색..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full p-3 pl-10 border-2 border-black font-bold focus:outline-none focus:shadow-neo"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>

                        {/* 선택된 커리큘럼 표시 */}
                        {selectedCurriculum && (
                            <div className="bg-blue-100 border-2 border-black p-3 shadow-neo-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-black text-lg">{selectedCurriculum.title}</div>
                                        <div className="text-sm font-bold text-slate-600 mt-1">
                                            단어장: {selectedCurriculum.wordbooks.join(', ')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCurriculum(null)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 드롭다운 목록 */}
                        {showDropdown && !selectedCurriculum && (
                            <div className="border-2 border-black bg-white max-h-60 overflow-y-auto shadow-neo">
                                {filteredCurriculums.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 font-bold">
                                        검색 결과가 없습니다.
                                    </div>
                                ) : (
                                    filteredCurriculums.map(curr => (
                                        <button
                                            key={curr.id}
                                            onClick={() => {
                                                setSelectedCurriculum(curr);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left p-3 border-b border-slate-200 hover:bg-yellow-50 transition-colors"
                                        >
                                            <div className="font-bold">{curr.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {curr.wordbooks.length}개 단어장
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* 학습 요일 선택 */}
                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase bg-black text-white px-3 py-1 inline-block">
                            2. 학습 요일 선택
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {weekDays.map(day => (
                                <button
                                    key={day.id}
                                    onClick={() => toggleDay(day.id)}
                                    className={`p-3 border-2 border-black font-black text-lg transition-all ${selectedDays.includes(day.id)
                                        ? `bg-${day.color}-300 shadow-neo`
                                        : 'bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 시작일 선택 */}
                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase bg-black text-white px-3 py-1 inline-block">
                            3. 시작일 선택
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo"
                        />
                    </div>


                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-black bg-white flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        className="bg-red-500 text-white hover:bg-red-600 border-black"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleRegister}
                        className="bg-black text-white hover:bg-slate-800 border-white px-8"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        등록
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddCurriculumModal;
