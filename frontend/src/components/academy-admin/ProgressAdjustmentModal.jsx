import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import Button from '../common/Button';

const ProgressAdjustmentModal = ({ isOpen, onClose, curriculum }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        targetCurriculum: '',
        targetTextbook: '',
        targetUnit: '',
        startDate: ''
    });

    const handleSave = () => {
        // Implement save logic here
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl border-4 border-black shadow-neo-lg">
                {/* Header */}
                <div className="p-4 border-b-4 border-black flex justify-between items-center bg-white">
                    <h3 className="font-display font-black text-2xl uppercase tracking-tight">수업 진도 조율</h3>
                    <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 bg-bg">
                    <div className="space-y-6">
                        {/* Current Curriculum */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">커리큘럼</label>
                            <div className="col-span-3">
                                <div className="neo-input bg-white text-slate-500 flex items-center">
                                    {curriculum?.name || '초3~6 / 초등입문(G) - 3.0 (하루에 0.5소단원)[1]'}
                                </div>
                            </div>
                        </div>

                        {/* Change Curriculum */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">변경 커리큘럼</label>
                            <div className="col-span-3 flex gap-3">
                                <input
                                    type="text"
                                    placeholder="초3~6 / 초등입문(G) - 3.0 (하루에 0.5소단원)[1]"
                                    className="neo-input flex-1"
                                    value={formData.targetCurriculum}
                                    onChange={(e) => setFormData({ ...formData, targetCurriculum: e.target.value })}
                                />
                                <Button className="neo-btn bg-primary text-white hover:bg-blue-600">
                                    검색
                                </Button>
                            </div>
                        </div>

                        {/* Change Textbook */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">변경 교재</label>
                            <div className="col-span-3">
                                <input
                                    type="text"
                                    className="neo-input"
                                    value={formData.targetTextbook}
                                    onChange={(e) => setFormData({ ...formData, targetTextbook: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Change Unit */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">변경 소단원</label>
                            <div className="col-span-3 flex gap-3">
                                <input
                                    type="text"
                                    className="neo-input flex-1"
                                    value={formData.targetUnit}
                                    onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                                />
                                <Button className="neo-btn bg-primary text-white hover:bg-blue-600">
                                    검색
                                </Button>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">시작 날짜</label>
                            <div className="col-span-3">
                                <select
                                    className="neo-input w-full"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                >
                                    <option value="">선택</option>
                                    <option value="today">오늘부터</option>
                                    <option value="tomorrow">내일부터</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-black flex justify-end bg-white">
                    <Button onClick={handleSave} className="neo-btn bg-success text-white hover:bg-green-600 px-8 text-lg">
                        설정 저장
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProgressAdjustmentModal;
