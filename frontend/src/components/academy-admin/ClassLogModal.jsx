import React, { useState, useEffect } from 'react';
import { X, Calendar, Settings, Trash2, Clock, ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import Button from '../common/Button';
import LearningSettingsModal from './LearningSettingsModal';
import LearningDaysModal from './LearningDaysModal';
import ProgressAdjustmentModal from './ProgressAdjustmentModal';
import AddCurriculumModal from './AddCurriculumModal';

const ClassLogModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [addCurriculumModalOpen, setAddCurriculumModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [visibleWeeks, setVisibleWeeks] = useState(4);
    const [curriculums, setCurriculums] = useState([]);

    // Load curriculums from localStorage
    useEffect(() => {
        if (student && isOpen) {
            const storageKey = `curriculums_${student.id}`;
            const savedCurriculums = localStorage.getItem(storageKey);
            if (savedCurriculums) {
                setCurriculums(JSON.parse(savedCurriculums));
            } else {
                setCurriculums([]); // Reset if no data found
            }
        }
    }, [student, isOpen]);

    // Save curriculums to localStorage
    const saveCurriculums = (newCurriculums) => {
        const storageKey = `curriculums_${student.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newCurriculums));
        setCurriculums(newCurriculums);
    };

    // 커리큘럼 등록 핸들러
    const handleAddCurriculum = (curriculumData) => {
        // 중복 체크
        const isDuplicate = curriculums.some(c => c.curriculumId === curriculumData.curriculumId);
        if (isDuplicate) {
            alert('이미 등록된 커리큘럼입니다.');
            return;
        }

        const newCurriculum = {
            id: Date.now(),
            ...curriculumData,
            createdAt: new Date().toISOString()
        };

        const updatedCurriculums = [...curriculums, newCurriculum];
        saveCurriculums(updatedCurriculums);
        setAddCurriculumModalOpen(false);
        alert('커리큘럼이 등록되었습니다.');
    };

    // 커리큘럼 삭제 핸들러
    const handleDeleteCurriculum = (curriculumId) => {
        if (window.confirm('이 커리큘럼을 삭제하시겠습니까?')) {
            const updatedCurriculums = curriculums.filter(c => c.id !== curriculumId);
            saveCurriculums(updatedCurriculums);
        }
    };

    // Mock Schedule Data
    const weekDays = ['월', '화', '수', '목', '금'];
    const dayMap = {
        'mon': '월',
        'tue': '화',
        'wed': '수',
        'thu': '목',
        'fri': '금'
    };

    // Helper to get dates for a specific week offset
    const getWeekDates = (startDate, weekOffset) => {
        const start = new Date(startDate);
        start.setDate(start.getDate() + (weekOffset * 7));

        const dates = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date.toISOString().split('T')[0].replace(/-/g, '/'));
        }
        return dates;
    };

    // 스케줄 생성 함수
    const generateSchedule = (curriculum, weekOffset = 0) => {
        const schedule = {};
        const { days, wordbooks, startDate } = curriculum;

        if (!days || !wordbooks || !startDate) return schedule;

        // 각 요일에 단어장 배치
        const wordbooksPerDay = Math.ceil(wordbooks.length / days.length);

        days.forEach((dayId, index) => {
            const dayLabel = dayMap[dayId];
            const wordbookIndex = index * wordbooksPerDay;
            const assignedWordbook = wordbooks[wordbookIndex % wordbooks.length];

            if (dayLabel && assignedWordbook) {
                schedule[dayLabel] = {
                    type: 'learning',
                    textbook: curriculum.title,
                    unit: assignedWordbook,
                    subUnit: '진도 진행',
                    range: `${wordbooksPerDay}개 단어장`
                };
            }
        });

        return schedule;
    };

    const openSettings = (curr) => {
        setSelectedCurriculum(curr);
        setSettingsModalOpen(true);
    };

    const openDays = (curr) => {
        setSelectedCurriculum(curr);
        setDaysModalOpen(true);
    };

    const openProgress = (curr) => {
        setSelectedCurriculum(curr);
        setProgressModalOpen(true);
    };

    const handleLoadMore = () => {
        setVisibleWeeks(prev => prev + 4);
    };

    // Day colors configuration - Unified to Yellow for Neo-Brutalism style
    const dayColors = {
        '월': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '화': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '수': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '목': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '금': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
            <div className="bg-white w-[98vw] max-h-[95vh] overflow-y-auto border-4 border-black shadow-neo-lg flex flex-col">
                {/* Header */}
                <div className="p-6 border-b-4 border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-3xl font-display font-black uppercase mb-1 tracking-tight">수업일지</h2>
                        <div className="flex items-center gap-4 text-lg font-bold text-slate-600">
                            <span className="bg-black text-white px-2 py-1 transform -rotate-2">{student.studentId}</span>
                            <span>{student.name}</span>
                            <span className="text-slate-400">|</span>
                            <span>{student.className}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setAddCurriculumModalOpen(true)}
                            className="bg-green-500 text-white hover:bg-green-600 border-black shadow-neo"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            커리큘럼 등록
                        </Button>
                        <div className="flex items-center gap-2 bg-white p-2 border-2 border-black shadow-neo-sm">
                            <span className="font-black text-sm bg-yellow-300 px-2 border border-black">검색시작일</span>
                            <input
                                type="date"
                                className="bg-transparent font-bold focus:outline-none ml-2"
                                value={currentDate.toISOString().split('T')[0]}
                                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                            />
                            <button className="bg-black text-white p-1 hover:scale-110 transition-transform">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none">
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grids */}
                <div className="p-8 bg-bg space-y-12">
                    {Array.from({ length: visibleWeeks }).map((_, weekIndex) => {
                        const weekDates = getWeekDates(currentDate, weekIndex);
                        return (
                            <div key={weekIndex} className="space-y-4">
                                <h3 className="font-black text-xl bg-yellow-300 inline-block px-4 py-2 border-2 border-black shadow-neo">
                                    {weekIndex === 0 ? '이번 주' : `${weekIndex}주 후`} <span className="text-sm font-medium ml-2">({weekDates[0]} ~ {weekDates[4]})</span>
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <thead>
                                            <tr>
                                                <th className="border-b-4 border-r-4 border-black p-4 bg-black text-white w-48 text-left">
                                                    <span className="font-black text-xl italic tracking-wider">CURRICULUM</span>
                                                </th>
                                                {weekDays.map((day, i) => (
                                                    <th key={day} className={`border-b-4 border-r-4 border-black p-2 ${dayColors[day].bg} min-w-[140px] transition-colors relative group`}>
                                                        <div className="flex flex-col items-start relative z-10">
                                                            <span className="font-black text-3xl uppercase italic tracking-tighter transform -rotate-2 group-hover:rotate-0 transition-transform">{day}</span>
                                                            <span className="text-[10px] font-black bg-white px-1.5 py-0.5 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mt-1">{weekDates[i]}</span>
                                                        </div>
                                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {curriculums.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                                                        등록된 커리큘럼이 없습니다.
                                                        <br />
                                                        <button
                                                            onClick={() => setAddCurriculumModalOpen(true)}
                                                            className="mt-4 text-blue-600 hover:underline font-black"
                                                        >
                                                            커리큘럼 등록하기 →
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                curriculums.map((curr) => {
                                                    const schedule = generateSchedule(curr, weekIndex);
                                                    return (
                                                        <tr key={curr.id} className="group">
                                                            <td className="border-r-4 border-b-4 border-black p-4 align-top bg-slate-50">
                                                                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 h-full flex flex-col gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                                                                    <div className="font-black text-lg border-b-2 border-black pb-2">{curr.title}</div>
                                                                    <div className="text-xs text-slate-600 font-bold">
                                                                        시작일: {curr.startDate}
                                                                    </div>
                                                                    <div className="flex flex-col gap-2 mt-auto">
                                                                        <button
                                                                            onClick={() => openSettings(curr)}
                                                                            className="w-full text-center text-[11px] font-black px-2 py-1.5 bg-blue-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
                                                                        >
                                                                            <Settings className="w-3 h-3" /> 학습 설정
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openProgress(curr)}
                                                                            className="w-full text-center text-[11px] font-black px-2 py-1.5 bg-green-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
                                                                        >
                                                                            <Clock className="w-3 h-3" /> 수업 진도 변경
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openDays(curr)}
                                                                            className="w-full text-center text-[11px] font-black px-2 py-1.5 bg-yellow-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
                                                                        >
                                                                            <Calendar className="w-3 h-3" /> 학습 요일 변경
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteCurriculum(curr.id)}
                                                                            className="w-full text-center text-[11px] font-black px-2 py-1.5 bg-red-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" /> 커리큘럼 삭제
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {weekDays.map((day) => {
                                                                const scheduleItem = schedule[day];
                                                                return (
                                                                    <td key={day} className={`border-r-4 border-b-4 border-black p-2 align-top h-48 ${dayColors[day].hover} transition-colors duration-200`}>
                                                                        {scheduleItem ? (
                                                                            <div className="h-full flex flex-col justify-between bg-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                                                                                <div className="space-y-2 text-sm">
                                                                                    <div className="font-black text-base border-b border-black pb-1 mb-2">{scheduleItem.textbook}</div>
                                                                                    <div className="flex justify-between items-center group/item">
                                                                                        <span className="font-medium">{scheduleItem.unit}</span>
                                                                                        <button className="text-xs text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-700 font-bold">×</button>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center group/item">
                                                                                        <span className="text-slate-600">{scheduleItem.subUnit}</span>
                                                                                        <button className="text-xs text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-700 font-bold">×</button>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center group/item bg-white border border-black p-1 shadow-sm">
                                                                                        <span className="font-bold text-xs">진도: {scheduleItem.range}</span>
                                                                                        <button className="text-xs text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-700 font-bold">×</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                                <button className="text-2xl text-slate-300 hover:text-black font-black">+</button>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-center pt-4 pb-8">
                        <Button onClick={handleLoadMore} className="neo-btn bg-black text-white px-12 py-4 text-xl hover:bg-slate-800 hover:scale-105 transform transition-all">
                            계속 (다음 일정 불러오기)
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sub Modals */}
            <LearningSettingsModal
                isOpen={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                curriculum={selectedCurriculum}
            />
            <LearningDaysModal
                isOpen={daysModalOpen}
                onClose={() => setDaysModalOpen(false)}
                curriculum={selectedCurriculum}
            />
            <ProgressAdjustmentModal
                isOpen={progressModalOpen}
                onClose={() => setProgressModalOpen(false)}
                curriculum={selectedCurriculum}
            />
            <AddCurriculumModal
                isOpen={addCurriculumModalOpen}
                onClose={() => setAddCurriculumModalOpen(false)}
                onRegister={handleAddCurriculum}
                student={student}
            />
        </div>
    );
};

export default ClassLogModal;
