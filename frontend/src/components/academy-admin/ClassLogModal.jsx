import React, { useState } from 'react';
import { X, Calendar, Settings, Trash2, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Button from '../common/Button';
import LearningSettingsModal from './LearningSettingsModal';
import LearningDaysModal from './LearningDaysModal';
import ProgressAdjustmentModal from './ProgressAdjustmentModal';

const ClassLogModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [visibleWeeks, setVisibleWeeks] = useState(4); // Default to showing 4 weeks

    // Mock Schedule Data
    const weekDays = ['월', '화', '수', '목', '금'];

    // Helper to get dates for a specific week offset
    const getWeekDates = (startDate, weekOffset) => {
        const start = new Date(startDate);
        start.setDate(start.getDate() + (weekOffset * 7));

        // Adjust to Monday of that week if needed, for now assuming startDate is the start
        // or just generating 5 days from that start date
        const dates = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date.toISOString().split('T')[0].replace(/-/g, '/'));
        }
        return dates;
    };

    const mockSchedule = [
        {
            id: 1,
            name: '등록된 커리큘럼 1명',
            schedule: {
                '월': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
                '수': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
                '금': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
            }
        },
        {
            id: 2,
            name: '등록된 커리큘럼 2명',
            schedule: {
                '월': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
                '수': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
                '금': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
            }
        },
        {
            id: 3,
            name: '등록된 커리큘럼 3명',
            schedule: {
                '화': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
                '목': { type: 'learning', textbook: '교재명', unit: '대단원명', subUnit: '소단원명', range: '진도 범위(개수)' },
            }
        }
    ];

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-7xl max-h-[95vh] overflow-y-auto border-4 border-black shadow-neo-lg flex flex-col">
                {/* Header */}
                <div className="p-6 border-b-4 border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-3xl font-black uppercase mb-1">수업일지 (화면)</h2>
                        <div className="flex items-center gap-4 text-lg font-bold text-slate-600">
                            <span>{student.studentId}</span>
                            <span>{student.name}</span>
                            <span>{student.className}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 p-2 border-2 border-black rounded">
                            <span className="font-bold text-sm">검색시작일</span>
                            <input
                                type="date"
                                className="bg-transparent font-bold focus:outline-none"
                                value={currentDate.toISOString().split('T')[0]}
                                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                            />
                            <button className="bg-black text-white p-1 rounded hover:bg-slate-800">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full border-2 border-transparent hover:border-black transition-all">
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grids */}
                <div className="p-6 space-y-8">
                    {Array.from({ length: visibleWeeks }).map((_, weekIndex) => {
                        const weekDates = getWeekDates(currentDate, weekIndex);
                        return (
                            <div key={weekIndex} className="space-y-2">
                                <h3 className="font-black text-xl bg-yellow-100 inline-block px-2 border-2 border-black shadow-neo-sm">
                                    {weekIndex === 0 ? '이번 주' : `${weekIndex}주 후`} ({weekDates[0]} ~ {weekDates[4]})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border-2 border-black">
                                        <thead>
                                            <tr>
                                                <th className="border-2 border-black p-3 bg-slate-50 w-48">커리큘럼</th>
                                                {weekDays.map((day, i) => (
                                                    <th key={day} className="border-2 border-black p-3 bg-slate-50 min-w-[200px]">
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-black text-lg">{day}</span>
                                                            <span className="text-xs text-slate-500 font-mono">{weekDates[i]}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockSchedule.map((curr) => (
                                                <tr key={curr.id}>
                                                    <td className="border-2 border-black p-4 align-top bg-slate-50">
                                                        <div className="font-black text-lg mb-4">{curr.name}</div>
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => openSettings(curr)}
                                                                className="text-left text-xs font-bold px-2 py-1 bg-white border-2 border-black hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-neo-sm"
                                                            >
                                                                학습 설정
                                                            </button>
                                                            <button
                                                                onClick={() => openProgress(curr)}
                                                                className="text-left text-xs font-bold px-2 py-1 bg-white border-2 border-black hover:bg-green-50 hover:text-green-600 transition-colors shadow-neo-sm"
                                                            >
                                                                수업 진도 변경
                                                            </button>
                                                            <button
                                                                onClick={() => openDays(curr)}
                                                                className="text-left text-xs font-bold px-2 py-1 bg-white border-2 border-black hover:bg-yellow-50 hover:text-yellow-600 transition-colors shadow-neo-sm"
                                                            >
                                                                학습 요일 변경
                                                            </button>
                                                            <button className="text-left text-xs font-bold px-2 py-1 bg-white border-2 border-black hover:bg-red-50 hover:text-red-600 transition-colors shadow-neo-sm"
                                                            >
                                                                커리큘럼 삭제
                                                            </button>
                                                        </div>
                                                    </td>
                                                    {weekDays.map((day) => {
                                                        const scheduleItem = curr.schedule[day];
                                                        return (
                                                            <td key={day} className="border-2 border-black p-2 align-top h-48 hover:bg-slate-50 transition-colors">
                                                                {scheduleItem ? (
                                                                    <div className="h-full flex flex-col justify-between">
                                                                        <div className="space-y-1 text-sm">
                                                                            <div className="font-bold text-slate-800">{scheduleItem.textbook}</div>
                                                                            <div className="flex justify-between items-center group">
                                                                                <span>{scheduleItem.unit}</span>
                                                                                <button className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600">(삭제)</button>
                                                                            </div>
                                                                            <div className="flex justify-between items-center group">
                                                                                <span>{scheduleItem.subUnit}</span>
                                                                                <button className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600">(삭제)</button>
                                                                            </div>
                                                                            <div className="flex justify-between items-center group">
                                                                                <span>{scheduleItem.range}</span>
                                                                                <button className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600">(삭제)</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-center pt-4 pb-8">
                        <Button onClick={handleLoadMore} className="bg-black text-white px-8 py-3 text-lg hover:bg-slate-800 shadow-neo">
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
        </div>
    );
};

export default ClassLogModal;
