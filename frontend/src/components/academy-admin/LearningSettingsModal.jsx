import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const LearningSettingsModal = ({ isOpen, onClose, curriculum }) => {
    if (!isOpen) return null;

    // Mock state for settings - in a real app, this would be initialized from props or API
    const [settings, setSettings] = useState({
        word: {
            passCriteria: 'correct',
            range: 15,
            timeLimit: 53,
            problemType: 'meaning_sound',
            answerType: 'subjective',
            problemCount: 15
        },
        cumulative: {
            passCriteria: 'correct',
            interval: 4,
            timeLimit: 20,
            problemType: 'meaning_sound',
            answerType: 'objective',
            problemCount: 60,
            resetEnabled: true
        }
    });

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-neo-lg flex flex-col">
                {/* Header */}
                <div className="p-4 border-b-4 border-black bg-white flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-display font-black uppercase text-2xl tracking-tight">학습 설정 - {curriculum?.name || '단어장'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-8 bg-bg space-y-8">
                    {/* Word Test Settings */}
                    <section>
                        <h4 className="font-black text-xl mb-6 border-l-4 border-black pl-3 uppercase">단어(Word) 문제 설정</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">합격 기준 설정</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.word.passCriteria}
                                        onChange={(e) => handleChange('word', 'passCriteria', e.target.value)}
                                    >
                                        <option value="correct">정답시</option>
                                        <option value="score">점수 기준</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">범위 설정</label>
                                    <input
                                        type="number"
                                        className="col-span-2 neo-input"
                                        value={settings.word.range}
                                        onChange={(e) => handleChange('word', 'range', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">제한 시간 설정</label>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-full neo-input"
                                            value={settings.word.timeLimit}
                                            onChange={(e) => handleChange('word', 'timeLimit', parseInt(e.target.value))}
                                        />
                                        <span className="font-bold text-sm">초</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">문제 출제 유형</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.word.problemType}
                                        onChange={(e) => handleChange('word', 'problemType', e.target.value)}
                                    >
                                        <option value="meaning_sound">문제(뜻) 표시 / 음원(철자) 미재생</option>
                                        <option value="sound_only">음원만 재생</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">답안 출제 유형</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.word.answerType}
                                        onChange={(e) => handleChange('word', 'answerType', e.target.value)}
                                    >
                                        <option value="subjective">주관식 - 전체완성(철자)</option>
                                        <option value="objective">객관식</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">문제 수 설정</label>
                                    <input
                                        type="number"
                                        className="col-span-2 neo-input"
                                        value={settings.word.problemCount}
                                        onChange={(e) => handleChange('word', 'problemCount', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-2 border-black border-dashed" />

                    {/* Cumulative Test Settings */}
                    <section>
                        <h4 className="font-black text-xl mb-6 border-l-4 border-black pl-3 uppercase">누적 테스트</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">합격 기준 설정</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.cumulative.passCriteria}
                                        onChange={(e) => handleChange('cumulative', 'passCriteria', e.target.value)}
                                    >
                                        <option value="correct">정답시</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">테스트 간격</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.cumulative.interval}
                                        onChange={(e) => handleChange('cumulative', 'interval', parseInt(e.target.value))}
                                    >
                                        <option value={4}>4회</option>
                                        <option value={5}>5회</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">제한 시간 설정</label>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-full neo-input"
                                            value={settings.cumulative.timeLimit}
                                            onChange={(e) => handleChange('cumulative', 'timeLimit', parseInt(e.target.value))}
                                        />
                                        <span className="font-bold text-sm">초</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">문제 출제 유형</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.cumulative.problemType}
                                        onChange={(e) => handleChange('cumulative', 'problemType', e.target.value)}
                                    >
                                        <option value="meaning_sound">문제(뜻) 표시 / 음원(철자) 미재생</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">답안 출제 유형</label>
                                    <select
                                        className="col-span-2 neo-input"
                                        value={settings.cumulative.answerType}
                                        onChange={(e) => handleChange('cumulative', 'answerType', e.target.value)}
                                    >
                                        <option value="objective">객관식 - 뜻 고르기</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">문제 수 설정</label>
                                    <input
                                        type="number"
                                        className="col-span-2 neo-input"
                                        value={settings.cumulative.problemCount}
                                        onChange={(e) => handleChange('cumulative', 'problemCount', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="font-bold text-sm text-black bg-warning border-2 border-black p-2 shadow-neo-sm text-center">새로하기 가능</label>
                                    <div className="col-span-2 flex gap-4">
                                        <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="resetEnabled"
                                                checked={settings.cumulative.resetEnabled}
                                                onChange={() => handleChange('cumulative', 'resetEnabled', true)}
                                                className="w-4 h-4 border-2 border-black accent-black"
                                            /> 사용
                                        </label>
                                        <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="resetEnabled"
                                                checked={!settings.cumulative.resetEnabled}
                                                onChange={() => handleChange('cumulative', 'resetEnabled', false)}
                                                className="w-4 h-4 border-2 border-black accent-black"
                                            /> 사용 안함
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-black bg-white flex justify-end">
                    <Button onClick={onClose} className="neo-btn bg-success text-white hover:bg-green-600 px-8 text-lg">
                        <Save className="w-5 h-5 mr-2" /> 설정 저장
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LearningSettingsModal;
