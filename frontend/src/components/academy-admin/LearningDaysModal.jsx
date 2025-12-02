import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import Button from '../common/Button';

const LearningDaysModal = ({ isOpen, onClose, curriculum }) => {
    if (!isOpen) return null;

    const [days, setDays] = useState({
        mon: true, tue: false, wed: true, thu: false, fri: false, sat: false, sun: false
    });
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const toggleDay = (day) => {
        setDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const handleSave = () => {
        // In a real app, save to backend
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg border-4 border-black shadow-neo-lg">
                <div className="p-4 border-b-4 border-black flex justify-between items-center bg-white">
                    <h3 className="font-display font-black text-2xl uppercase tracking-tight">시간표 설정</h3>
                    <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-8 bg-bg space-y-8">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">영역</label>
                        <div className="col-span-3">
                            <div className="neo-input bg-white text-slate-500 flex items-center">
                                {curriculum?.name || '단어 1'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">학습 요일</label>
                        <div className="col-span-3 flex flex-wrap gap-3">
                            {[
                                { key: 'mon', label: '월' }, { key: 'tue', label: '화' }, { key: 'wed', label: '수' },
                                { key: 'thu', label: '목' }, { key: 'fri', label: '금' }, { key: 'sat', label: '토' }, { key: 'sun', label: '일' }
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer bg-white border-2 border-black p-2 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                                    <input
                                        type="checkbox"
                                        checked={days[key]}
                                        onChange={() => toggleDay(key)}
                                        className="w-5 h-5 border-2 border-black accent-black"
                                    />
                                    <span className="text-sm font-bold">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4 border-t-2 border-black border-dashed pt-6">
                        <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">시작 날짜</label>
                        <div className="col-span-3 relative">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="neo-input w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t-4 border-black flex justify-end bg-white">
                    <Button onClick={handleSave} className="neo-btn bg-success text-white hover:bg-green-600 px-8 text-lg">
                        설정 저장
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LearningDaysModal;
