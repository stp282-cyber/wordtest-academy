import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { generateScheduleForDate } from '../../utils/scheduleUtils';

const Learning = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visibleWeeks, setVisibleWeeks] = useState(4);
    const [curriculums, setCurriculums] = useState([]);

    // Load curriculums from localStorage
    useEffect(() => {
        if (user) {
            const storageKey = `curriculums_${user.id}`;
            const savedCurriculums = localStorage.getItem(storageKey);
            if (savedCurriculums) {
                setCurriculums(JSON.parse(savedCurriculums));
            }
        }
    }, [user]);

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

    // Generate schedule for a specific week
    const generateSchedule = (curriculum, weekOffset = 0) => {
        const schedule = {};
        const { days, startDate } = curriculum;

        if (!days || !startDate) return schedule;

        const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
        const curriculumDetail = savedCurriculums.find(c => c.id === curriculum.curriculumId);

        if (!curriculumDetail || !curriculumDetail.items || curriculumDetail.items.length === 0) {
            return schedule;
        }

        const startDateObj = new Date(startDate);
        const daysFromStart = weekOffset * 7;

        days.forEach((dayId, dayIndexInWeek) => {
            const dayLabel = dayMap[dayId];
            if (!dayLabel) return;

            const learningDaysElapsed = weekOffset * days.length + dayIndexInWeek;

            // Calculate date for this day
            const currentDayDate = new Date(startDateObj);
            currentDayDate.setDate(currentDayDate.getDate() + learningDaysElapsed);

            // Use the utility function to generate schedule for this date
            const daySchedule = generateScheduleForDate(curriculum, currentDayDate);

            if (daySchedule) {
                schedule[dayLabel] = daySchedule;
            }
        });

        return schedule;
    };

    const handleLoadMore = () => {
        setVisibleWeeks(prev => prev + 4);
    };

    const handleStartLesson = (curriculum, schedule) => {
        // Store lesson data and navigate to test page
        const lessonData = {
            curriculum,
            schedule,
            words: schedule.words
        };
        localStorage.setItem('currentLesson', JSON.stringify(lessonData));
        window.location.href = '/student/test';
    };

    // Day colors configuration
    const dayColors = {
        '월': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '화': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '수': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '목': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '금': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">나의 학습 일정</h1>
                    <p className="text-slate-600 font-mono font-bold">주간 학습 계획을 확인하세요</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 border-2 border-black shadow-neo-sm">
                    <span className="font-black text-sm bg-yellow-300 px-2 border border-black">검색시작일</span>
                    <input
                        type="date"
                        className="bg-transparent font-bold focus:outline-none ml-2"
                        value={currentDate.toISOString().split('T')[0]}
                        onChange={(e) => setCurrentDate(new Date(e.target.value))}
                    />
                </div>
            </div>

            {/* Calendar Grids */}
            <div className="space-y-12">
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
                                                <th key={day} className={`border-b-4 border-r-4 border-black p-2 ${dayColors[day].bg} w-1/5 transition-colors relative group`}>
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
                                                </td>
                                            </tr>
                                        ) : (
                                            curriculums.map((curr) => {
                                                const schedule = generateSchedule(curr, weekIndex);
                                                return (
                                                    <tr key={curr.id} className="group">
                                                        <td className="border-r-4 border-b-4 border-black p-4 align-top bg-slate-50">
                                                            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 h-full flex flex-col gap-2">
                                                                <div className="font-black text-lg border-b-2 border-black pb-2">{curr.title}</div>
                                                                <div className="text-xs text-slate-600 font-bold">
                                                                    시작일: {curr.startDate}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {weekDays.map((day) => {
                                                            const scheduleItem = schedule[day];
                                                            return (
                                                                <td key={day} className={`border-r-4 border-b-4 border-black p-2 align-top h-48 ${dayColors[day].hover} transition-colors duration-200`}>
                                                                    {scheduleItem ? (
                                                                        <div className="h-full flex flex-col justify-between bg-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                                                                            <div className="space-y-1.5 text-sm">
                                                                                <div className="font-black text-base border-b border-black pb-1 mb-2">{scheduleItem.textbook}</div>

                                                                                {scheduleItem.major && (
                                                                                    <>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">대단원:</span>
                                                                                            <span className="font-bold text-sm">{scheduleItem.major}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">소단원:</span>
                                                                                            <span className="font-bold text-sm">{scheduleItem.minor}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-xs text-slate-500">단원명:</span>
                                                                                            <span className="font-medium text-sm">{scheduleItem.unitName}</span>
                                                                                        </div>
                                                                                        <div className="bg-blue-50 border border-blue-200 p-1.5 mt-2">
                                                                                            <div className="text-xs text-blue-600 font-bold">진도 범위</div>
                                                                                            <div className="text-xs font-mono mt-0.5">{scheduleItem.wordRange}</div>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center bg-yellow-50 border border-yellow-300 p-1.5 mt-1">
                                                                                            <span className="text-xs font-bold text-yellow-800">{scheduleItem.date}</span>
                                                                                            <span className="text-xs font-black text-yellow-900">{scheduleItem.wordCount}개 단어</span>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                className="w-full mt-2 bg-green-400 hover:bg-green-500 border-black text-black font-black shadow-neo-sm"
                                                                                onClick={() => handleStartLesson(curr, scheduleItem)}
                                                                            >
                                                                                <Play className="w-4 h-4 mr-1" />
                                                                                수업 시작
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full w-full"></div>
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
    );
};

export default Learning;
