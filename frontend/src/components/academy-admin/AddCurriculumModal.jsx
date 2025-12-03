import React, { useState, useEffect } from 'react';
import { X, Save, Search, Copy, Clipboard } from 'lucide-react';
import Button from '../common/Button';

const AddCurriculumModal = ({ isOpen, onClose, onRegister, student }) => {
    if (!isOpen || !student) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [startNumber, setStartNumber] = useState(1);
    const [reviewCycles, setReviewCycles] = useState(3);
    const [showDropdown, setShowDropdown] = useState(false);
    const [availableCurriculums, setAvailableCurriculums] = useState([]);


    // Load curriculums from localStorage
    useEffect(() => {
        if (isOpen) {
            try {
                // Load from localStorage.curriculums (same as CurriculumList page)
                const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
                console.log('Loaded curriculums from localStorage:', savedCurriculums);

                setAvailableCurriculums(savedCurriculums.map(curr => ({
                    id: curr.id,
                    title: curr.name,
                    wordbooks: Array.isArray(curr.wordbooks) ? curr.wordbooks : [curr.name]
                })));
            } catch (error) {
                console.error('Failed to load curriculums:', error);
                setAvailableCurriculums([]);
            }
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
            startNumber: parseInt(startNumber) || 1,
            reviewCycles: parseInt(reviewCycles) || 3,
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
        setStartNumber(1);
        setReviewCycles(3);
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
            startDate: startDate,
            startNumber: startNumber,
            reviewCycles: reviewCycles
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
            setStartNumber(data.startNumber || 1);
            setReviewCycles(data.reviewCycles || 3);
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

                    {/* 시작 번호 입력 */}
                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase bg-black text-white px-3 py-1 inline-block">
                            4. 시작 번호
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={startNumber}
                            onChange={(e) => setStartNumber(e.target.value)}
                            placeholder="첫 번째 단어 번호 (예: 1)"
                            className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo"
                        />
                        <p className="text-xs text-slate-500 font-bold">커리큘럼 첫 번째 단어장의 시작 번호를 입력하세요.</p>
                    </div>

                    {/* 복습 시험 횟수 선택 */}
                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase bg-black text-white px-3 py-1 inline-block">
                            5. 복습 시험 횟수 (통과 후)
                        </label>
                        <select
                            value={reviewCycles}
                            onChange={(e) => setReviewCycles(parseInt(e.target.value))}
                            className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo"
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}회</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 font-bold">시험 통과 후 해당 범위를 몇 번 더 복습할지 설정합니다. (기본 3회)</p>
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
                        등록하기
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddCurriculumModal;
