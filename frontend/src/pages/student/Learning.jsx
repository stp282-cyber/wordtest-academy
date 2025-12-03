import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { generateScheduleForDate } from '../../utils/scheduleUtils';

const Learning = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visibleWeeks, setVisibleWeeks] = useState(4);
    const [curriculums, setCurriculums] = useState([]);

    const [learningHistory, setLearningHistory] = useState([]);

    // Load curriculums and history from API
    useEffect(() => {
        if (user) {
            loadCurriculums();
            loadHistory();
        }
    }, [user]);

    const loadCurriculums = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/curriculum/students/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCurriculums(data);
            } else {
                console.error('Failed to load curriculums');
                setCurriculums([]);
            }
        } catch (error) {
            console.error('Error loading curriculums:', error);
            setCurriculums([]);
        }
    };

    const loadHistory = () => {
        const historyKey = `learning_history_${user.id}`;
        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
            setLearningHistory(JSON.parse(savedHistory));
        }
    };

    const weekDays = ['월', '화', '수', '목', '금'];
    const dayMap = {
        'mon': '월',
        'tue': '화',
        'wed': '수',
        'thu': '목',
        'fri': '금'
    };

    // Helper to get dates for a specific week offset (Always starting from Monday)
    const getWeekDates = (baseDate, weekOffset) => {
        const start = new Date(baseDate);
        // Find Monday of the current week
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        start.setDate(diff);

        // Apply week offset
        start.setDate(start.getDate() + (weekOffset * 7));

        const dates = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            // Use local time formatting to match scheduleUtils
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            dates.push(`${year}/${month}/${dayStr}`);
        }
        return dates;
    };

    // Generate schedule for a specific week
    const generateSchedule = (curriculum, weekOffset = 0) => {
        const schedule = {};
        const { days, startDate } = curriculum;

        if (!days || !startDate) return schedule;

        // Calculate Monday of the target week
        const targetMonday = new Date(currentDate);
        const day = targetMonday.getDay();
        const diff = targetMonday.getDate() - day + (day === 0 ? -6 : 1);
        targetMonday.setDate(diff);
        targetMonday.setDate(targetMonday.getDate() + (weekOffset * 7));

        days.forEach((dayId) => {
            const dayLabel = dayMap[dayId];
            if (!dayLabel) return;

            // Find the date for this day (Mon-Fri)
            const standardDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
            const dayIndex = standardDays.indexOf(dayId);

            if (dayIndex === -1) return;

            const targetDate = new Date(targetMonday);
            targetDate.setDate(targetMonday.getDate() + dayIndex);

            // Use the utility function to generate schedule for this date
            const daySchedule = generateScheduleForDate(curriculum, targetDate);

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

    const getScheduleStatus = (scheduleItem, curriculumId) => {
        if (!scheduleItem) return 'none';

        // Use local date string for comparison to avoid timezone issues
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const scheduleDateStr = scheduleItem.date;

        // Check completion
        const isCompleted = learningHistory.some(h =>
            h.curriculumId === curriculumId && h.date === scheduleItem.date
        );

        if (isCompleted) return 'completed';
        if (scheduleDateStr === todayStr) return 'today';
        if (scheduleDateStr < todayStr) return 'past-incomplete';
        return 'future';
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return {
                    // Darker, dimmed, "done" look
                    card: 'bg-slate-300 border-slate-500 shadow-none opacity-70 grayscale',
                    header: 'bg-slate-600 text-slate-300 border-slate-500',
                    body: 'bg-slate-300',
                    footer: 'bg-slate-400 text-slate-600 border-slate-500',
                    text: 'text-slate-500 line-through decoration-2',
                    badge: 'bg-slate-600 text-slate-300 border-slate-500'
                };
            case 'today':
                return {
                    // Active, vibrant look
                    card: 'bg-yellow-300 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -translate-y-1 ring-4 ring-black ring-offset-2 ring-offset-white',
                    header: 'bg-blue-600 text-white border-black',
                    body: 'bg-yellow-300',
                    footer: 'bg-white text-black border-black',
                    text: 'text-black',
                    badge: 'bg-blue-600 text-white border-black'
                };
            case 'past-incomplete':
                return {
                    // Softer alert look
                    card: 'bg-red-100 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
                    header: 'bg-black text-red-300 border-black',
                    body: 'bg-red-100',
                    footer: 'bg-red-50 text-black border-black',
                    text: 'text-black',
                    badge: 'bg-black text-red-300 border-black'
                };
            default: // future
                return {
                    // Standard look
                    card: 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
                    header: 'bg-black text-white border-black',
                    body: 'bg-white',
                    footer: 'bg-slate-100 text-black border-black',
                    text: 'text-black',
                    badge: 'bg-black text-white border-black'
                };
        }
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

                            {/* Desktop View (Table) */}
                            <div className="hidden md:block overflow-x-auto pb-4">
                                <table className="w-full min-w-[1000px] border-collapse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="border-b-4 border-r-4 border-black p-4 bg-black text-white w-48 text-left">
                                                <span className="font-black text-xl italic tracking-wider">CURRICULUM</span>
                                            </th>
                                            {weekDays.map((day, i) => (
                                                <th key={day} className={`border-b-4 border-r-4 border-black p-2 ${dayColors[day].bg} transition-colors relative group`}>
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
                                                            const status = getScheduleStatus(scheduleItem, curr.id);
                                                            const styles = getStatusStyles(status);

                                                            return (
                                                                <td key={day} className={`border-r-4 border-b-4 border-black p-2 align-top h-48 ${dayColors[day].hover} transition-colors duration-200`}>
                                                                    {scheduleItem ? (
                                                                        <div className={`h-full flex flex-col border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all overflow-hidden group/card relative ${styles.card}`}>
                                                                            {/* Header */}
                                                                            <div className={`p-2 text-center border-b-2 ${styles.header}`}>
                                                                                <div className="font-black text-xs truncate" title={scheduleItem.textbook}>{scheduleItem.textbook}</div>
                                                                            </div>

                                                                            {/* Content */}
                                                                            <div className={`flex-1 p-2 flex flex-col items-center justify-center text-center gap-1 min-h-0 pb-10 ${styles.body}`}>
                                                                                {status === 'completed' && (
                                                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none">
                                                                                        <Check className="w-20 h-20 text-black" />
                                                                                    </div>
                                                                                )}
                                                                                {scheduleItem.major ? (
                                                                                    <>
                                                                                        <div className={`text-[10px] font-bold uppercase tracking-tight truncate w-full ${styles.text}`}>
                                                                                            {scheduleItem.major} <span className="opacity-50">|</span> {scheduleItem.minor}
                                                                                        </div>
                                                                                        <div className={`font-black text-sm leading-tight line-clamp-2 break-keep ${styles.text}`} title={scheduleItem.unitName}>
                                                                                            {scheduleItem.unitName}
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className={`text-[10px] font-bold uppercase tracking-tight truncate w-full ${styles.text}`}>
                                                                                            {scheduleItem.unit}
                                                                                        </div>
                                                                                        <div className={`font-black text-sm leading-tight line-clamp-2 break-keep ${styles.text}`}>
                                                                                            {scheduleItem.subUnit}
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            {/* Footer Info */}
                                                                            <div className={`grid grid-cols-2 border-t-2 divide-x-2 absolute bottom-0 left-0 right-0 ${styles.footer} ${status === 'completed' ? 'divide-slate-400' : 'divide-black'}`}>
                                                                                <div className="p-1.5 text-center flex flex-col justify-center">
                                                                                    <div className="text-[9px] font-black opacity-60 uppercase leading-none mb-0.5">RANGE</div>
                                                                                    <div className="font-black text-xs truncate">{scheduleItem.wordRange || scheduleItem.range}</div>
                                                                                </div>
                                                                                <div className="p-1.5 text-center flex flex-col justify-center">
                                                                                    <div className="text-[9px] font-black opacity-60 uppercase leading-none mb-0.5">WORDS</div>
                                                                                    <div className="font-black text-xs">{scheduleItem.wordCount || '-'}</div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Play Overlay */}
                                                                            <div className={`absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10 backdrop-blur-sm`}>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className={`${status === 'completed' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-green-400 hover:bg-green-500'} border-2 border-black text-black font-black shadow-neo-sm transform hover:scale-110 transition-transform`}
                                                                                    onClick={() => handleStartLesson(curr, scheduleItem)}
                                                                                >
                                                                                    <Play className="w-4 h-4 mr-1" />
                                                                                    {status === 'completed' ? 'REVIEW' : 'START'}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
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

                            {/* Mobile View (List) */}
                            <div className="md:hidden space-y-6">
                                {weekDays.map((day, dayIndex) => {
                                    // Gather lessons for this day
                                    const dayLessons = curriculums.map(curr => {
                                        const schedule = generateSchedule(curr, weekIndex);
                                        return { curr, item: schedule[day] };
                                    }).filter(entry => entry.item);

                                    if (dayLessons.length === 0) return null;

                                    return (
                                        <div key={day} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                            {/* Day Header */}
                                            <div className={`p-4 flex justify-between items-center border-b-4 border-black ${dayColors[day].bg}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-3xl italic">{day}</span>
                                                    <span className="text-xs font-bold bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        {weekDates[dayIndex]}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-black uppercase tracking-widest opacity-60">
                                                    {dayLessons.length} Tasks
                                                </div>
                                            </div>

                                            {/* Lessons List */}
                                            <div className="divide-y-4 divide-black">
                                                {dayLessons.map(({ curr, item }) => {
                                                    const status = getScheduleStatus(item, curr.id);
                                                    const styles = getStatusStyles(status);

                                                    return (
                                                        <div key={curr.id} className="p-4 bg-white">
                                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-500 mb-1">{curr.title}</div>
                                                                    <div className="font-black text-lg leading-tight">{item.textbook}</div>
                                                                </div>
                                                                <span className={`text-[10px] font-black px-2 py-1 border-2 border-black uppercase ${styles.badge}`}>
                                                                    {status === 'past-incomplete' ? 'Overdue' : status}
                                                                </span>
                                                            </div>

                                                            <div className={`border-2 border-black p-3 mb-4 relative ${styles.card} shadow-sm`}>
                                                                {status === 'completed' && (
                                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-20">
                                                                        <Check className="w-12 h-12 text-black" />
                                                                    </div>
                                                                )}

                                                                {item.major ? (
                                                                    <div className="space-y-1 relative z-10">
                                                                        <div className="text-xs font-bold opacity-70">{item.major} | {item.minor}</div>
                                                                        <div className="font-black text-base">{item.unitName}</div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-1 relative z-10">
                                                                        <div className="text-xs font-bold opacity-70">{item.unit}</div>
                                                                        <div className="font-black text-base">{item.subUnit}</div>
                                                                    </div>
                                                                )}

                                                                <div className="mt-3 pt-3 border-t-2 border-dashed border-black/20 flex gap-4 text-xs">
                                                                    <div>
                                                                        <span className="font-bold opacity-60 mr-1">RANGE:</span>
                                                                        <span className="font-black">{item.wordRange || item.range}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold opacity-60 mr-1">WORDS:</span>
                                                                        <span className="font-black">{item.wordCount || '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                className={`w-full py-3 text-sm font-black border-2 border-black shadow-neo-sm flex items-center justify-center gap-2 ${status === 'completed' ? 'bg-slate-200 text-slate-500' : 'bg-black text-white hover:bg-slate-800'}`}
                                                                onClick={() => handleStartLesson(curr, item)}
                                                            >
                                                                <Play className="w-4 h-4" />
                                                                {status === 'completed' ? '다시 학습하기 (Review)' : '학습 시작하기'}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
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
