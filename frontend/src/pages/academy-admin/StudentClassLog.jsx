import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Calendar, Settings, Trash2, Clock, ChevronLeft, ChevronRight, Search, Plus, Check, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import LearningSettingsModal from '../../components/academy-admin/LearningSettingsModal';
import LearningDaysModal from '../../components/academy-admin/LearningDaysModal';
import ProgressAdjustmentModal from '../../components/academy-admin/ProgressAdjustmentModal';
import AddCurriculumModal from '../../components/academy-admin/AddCurriculumModal';
import { generateScheduleForDate } from '../../utils/scheduleUtils';
import { getStudent } from '../../services/studentService';

const StudentClassLog = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [addCurriculumModalOpen, setAddCurriculumModalOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [visibleWeeks, setVisibleWeeks] = useState(4);
    const [curriculums, setCurriculums] = useState([]);
    const [learningHistory, setLearningHistory] = useState([]);

    // Load student data
    useEffect(() => {
        const loadStudentData = async () => {
            try {
                const data = await getStudent(studentId);
                // Map backend data to frontend structure
                const mappedStudent = {
                    ...data,
                    studentId: data.username, // Map username to studentId
                    className: data.className || '미배정'
                };
                setStudent(mappedStudent);
            } catch (error) {
                console.error('Failed to load student:', error);
                alert('학생 정보를 찾을 수 없습니다.');
                navigate('/academy-admin/students');
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            loadStudentData();
        }
    }, [studentId, navigate]);

    // Load curriculums and history
    useEffect(() => {
        if (student) {
            const storageKey = `curriculums_${student.id}`;
            const savedCurriculums = localStorage.getItem(storageKey);
            if (savedCurriculums) {
                setCurriculums(JSON.parse(savedCurriculums));
            } else {
                setCurriculums([]);
            }

            const historyKey = `learning_history_${student.id}`;
            const savedHistory = localStorage.getItem(historyKey);
            if (savedHistory) {
                setLearningHistory(JSON.parse(savedHistory));
            } else {
                setLearningHistory([]);
            }
        }
    }, [student]);

    // Save curriculums to localStorage
    const saveCurriculums = (newCurriculums) => {
        const storageKey = `curriculums_${student.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newCurriculums));
        setCurriculums(newCurriculums);
    };

    // 커리큘럼 등록 핸들러
    const handleAddCurriculum = (curriculumData) => {
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
            alert('커리큘럼이 삭제되었습니다.');
        }
    };

    // Mock Schedule Data
    const weekDays = ['월', '화', '수', '목', '금'];

    const getWeekDates = (baseDate, weekOffset) => {
        const start = new Date(baseDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setDate(start.getDate() + (weekOffset * 7));

        const dates = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date.toISOString().split('T')[0].replace(/-/g, '/'));
        }
        return dates;
    };

    const generateSchedule = (curriculum, weekOffset = 0) => {
        const schedule = {};
        const { days, startDate } = curriculum;

        if (!days || !startDate) return schedule;

        const targetMonday = new Date(currentDate);
        const day = targetMonday.getDay();
        const diff = targetMonday.getDate() - day + (day === 0 ? -6 : 1);
        targetMonday.setDate(diff);
        targetMonday.setDate(targetMonday.getDate() + (weekOffset * 7));

        weekDays.forEach((dayLabel, index) => {
            const targetDate = new Date(targetMonday);
            targetDate.setDate(targetMonday.getDate() + index);
            const dateDisplay = targetDate.toISOString().split('T')[0];

            const daySchedule = generateScheduleForDate(curriculum, targetDate);

            if (daySchedule) {
                schedule[dayLabel] = {
                    type: 'learning',
                    textbook: daySchedule.textbook,
                    major: daySchedule.major,
                    minor: daySchedule.minor,
                    unitName: daySchedule.unitName,
                    wordRange: daySchedule.wordRange,
                    wordCount: daySchedule.wordCount,
                    date: dateDisplay,
                    dailyGoal: daySchedule.dailyGoal
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

    const dayColors = {
        '월': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '화': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '수': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '목': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
        '금': { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-50', border: 'border-black' },
    };

    const getScheduleStatus = (scheduleItem, curriculumId) => {
        if (!scheduleItem) return 'none';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const scheduleDate = new Date(scheduleItem.date);
        scheduleDate.setHours(0, 0, 0, 0);

        const isCompleted = learningHistory.some(h =>
            h.curriculumId === curriculumId && h.date === scheduleItem.date
        );

        if (isCompleted) return 'completed';
        if (scheduleDate.getTime() === today.getTime()) return 'today';
        if (scheduleDate.getTime() < today.getTime()) return 'past-incomplete';
        return 'future';
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return {
                    card: 'bg-slate-100 border-slate-400 opacity-80',
                    header: 'bg-slate-600 text-slate-200 border-slate-600',
                    footer: 'bg-slate-200 text-slate-500 border-slate-400',
                    text: 'text-slate-500',
                    badge: 'bg-green-500 text-white border-green-700'
                };
            case 'today':
                return {
                    card: 'bg-white border-black ring-4 ring-yellow-300 ring-opacity-50',
                    header: 'bg-blue-600 text-white border-black',
                    footer: 'bg-yellow-300 text-black border-black',
                    text: 'text-black',
                    badge: 'bg-blue-500 text-white border-black'
                };
            case 'past-incomplete':
                return {
                    card: 'bg-red-50 border-red-500',
                    header: 'bg-red-500 text-white border-red-700',
                    footer: 'bg-red-200 text-red-900 border-red-400',
                    text: 'text-red-900',
                    badge: 'bg-red-500 text-white border-red-700'
                };
            default:
                return {
                    card: 'bg-white border-black',
                    header: 'bg-black text-white border-black',
                    footer: 'bg-yellow-300 text-black border-black',
                    text: 'text-black',
                    badge: 'bg-black text-white border-black'
                };
        }
    };

    const handleLoadMore = () => {
        setVisibleWeeks(prev => prev + 4);
    };

    if (loading || !student) {
        return <div className="p-8 text-center font-bold">학생 정보를 불러오는 중...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => navigate(-1)}
                        className="bg-white text-black hover:bg-slate-100 border-black shadow-neo p-2"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-display font-black uppercase mb-1 tracking-tight">수업일지</h2>
                        <div className="flex items-center gap-4 text-lg font-bold text-slate-600">
                            <span className="bg-black text-white px-2 py-1 transform -rotate-2">{student.studentId}</span>
                            <span>{student.name}</span>
                            <span className="text-slate-400">|</span>
                            <span>{student.className}</span>
                        </div>
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
                                <table className="w-full border-collapse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] table-fixed">
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
                                                            const status = getScheduleStatus(scheduleItem, curr.id);
                                                            const styles = getStatusStyles(status);

                                                            return (
                                                                <td key={day} className={`border-r-4 border-b-4 border-black p-2 align-top h-48 ${dayColors[day].hover} transition-colors duration-200`}>
                                                                    {scheduleItem ? (
                                                                        <div className={`h-full flex flex-col justify-between p-3 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all relative ${styles.card}`}>
                                                                            {status === 'completed' && (
                                                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-10 pointer-events-none">
                                                                                    <Check className="w-20 h-20 text-black" />
                                                                                </div>
                                                                            )}
                                                                            <div className="space-y-1.5 text-sm relative z-10">
                                                                                <div className={`font-black text-base border-b pb-1 mb-2 ${styles.header}`}>{scheduleItem.textbook}</div>

                                                                                {scheduleItem.major ? (
                                                                                    <>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className={`text-xs ${styles.text}`}>대단원:</span>
                                                                                            <span className={`font-bold text-sm ${styles.text}`}>{scheduleItem.major}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className={`text-xs ${styles.text}`}>소단원:</span>
                                                                                            <span className={`font-bold text-sm ${styles.text}`}>{scheduleItem.minor}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className={`text-xs ${styles.text}`}>단원명:</span>
                                                                                            <span className={`font-medium text-sm ${styles.text}`}>{scheduleItem.unitName}</span>
                                                                                        </div>
                                                                                        <div className={`border p-1.5 mt-2 ${styles.footer}`}>
                                                                                            <div className="text-xs font-bold">진도 범위</div>
                                                                                            <div className="text-xs font-mono mt-0.5">{scheduleItem.wordRange}</div>
                                                                                        </div>
                                                                                        <div className={`flex justify-between items-center border p-1.5 mt-1 ${styles.footer}`}>
                                                                                            <span className="text-xs font-bold">{scheduleItem.date}</span>
                                                                                            <span className="text-xs font-black">{scheduleItem.wordCount}개 단어</span>
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="flex justify-between items-center group/item">
                                                                                            <span className={`font-medium ${styles.text}`}>{scheduleItem.unit}</span>
                                                                                            <button className="text-xs text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-700 font-bold">×</button>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center group/item">
                                                                                            <span className={`text-slate-600 ${styles.text}`}>{scheduleItem.subUnit}</span>
                                                                                            <button className="text-xs text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-700 font-bold">×</button>
                                                                                        </div>
                                                                                        <div className={`flex justify-between items-center group/item border p-1 shadow-sm ${styles.footer}`}>
                                                                                            <span className="font-bold text-xs">진도: {scheduleItem.range}</span>
                                                                                            <button className="text-xs text-red-500 opacity-0 group-hover/item:opacity-100 hover:text-red-700 font-bold">×</button>
                                                                                        </div>
                                                                                    </>
                                                                                )}
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

export default StudentClassLog;
