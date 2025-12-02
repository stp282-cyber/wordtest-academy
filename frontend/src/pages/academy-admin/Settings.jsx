import React, { useState, useEffect } from 'react';
import { Save, Lock, Building2, Settings as SettingsIcon, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [generalInfo, setGeneralInfo] = useState({
        academyName: '이스턴영어공부방',
        contact: '010-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        ownerName: '홍길동'
    });

    const [testConfig, setTestConfig] = useState({
        passingScore: 80,
        defaultTimeLimit: 20,
        showResultImmediately: true,
        allowRetake: true
    });

    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Load from localStorage on mount
    useEffect(() => {
        const savedGeneral = localStorage.getItem('academy_general_settings');
        const savedTest = localStorage.getItem('academy_test_settings');

        if (savedGeneral) setGeneralInfo(JSON.parse(savedGeneral));
        if (savedTest) setTestConfig(JSON.parse(savedTest));
    }, []);

    const handleSaveGeneral = () => {
        localStorage.setItem('academy_general_settings', JSON.stringify(generalInfo));
        alert('학원 정보가 저장되었습니다.');
    };

    const handleSaveTestConfig = () => {
        localStorage.setItem('academy_test_settings', JSON.stringify(testConfig));
        alert('시험 설정이 저장되었습니다.');
    };

    const handlePasswordChange = () => {
        if (password.new !== password.confirm) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        alert('비밀번호가 변경되었습니다. (실제 변경은 백엔드 연동 필요)');
        setPassword({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-black uppercase italic">학원 설정</h1>
                <p className="text-slate-600 font-bold font-mono">학원 정보 및 시스템 설정을 관리하세요</p>
            </div>

            <div className="flex gap-4 border-b-4 border-black pb-1">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 font-black text-lg uppercase transition-all ${activeTab === 'general' ? 'bg-yellow-300 border-2 border-black shadow-neo -mb-3 z-10' : 'text-slate-500 hover:text-black'}`}
                >
                    <Building2 className="w-5 h-5 inline-block mr-2" /> 일반 정보
                </button>
                <button
                    onClick={() => setActiveTab('test')}
                    className={`px-6 py-3 font-black text-lg uppercase transition-all ${activeTab === 'test' ? 'bg-yellow-300 border-2 border-black shadow-neo -mb-3 z-10' : 'text-slate-500 hover:text-black'}`}
                >
                    <SettingsIcon className="w-5 h-5 inline-block mr-2" /> 시험 설정
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-3 font-black text-lg uppercase transition-all ${activeTab === 'security' ? 'bg-yellow-300 border-2 border-black shadow-neo -mb-3 z-10' : 'text-slate-500 hover:text-black'}`}
                >
                    <Lock className="w-5 h-5 inline-block mr-2" /> 보안
                </button>
            </div>

            <div className="pt-4">
                {activeTab === 'general' && (
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-6 max-w-2xl">
                        <h2 className="text-2xl font-black mb-6 flex items-center">
                            <Building2 className="w-6 h-6 mr-2" /> 학원 기본 정보
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">학원명</label>
                                <Input
                                    value={generalInfo.academyName}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, academyName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">대표자명</label>
                                <Input
                                    value={generalInfo.ownerName}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, ownerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">연락처</label>
                                <Input
                                    value={generalInfo.contact}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, contact: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">주소</label>
                                <Input
                                    value={generalInfo.address}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, address: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSaveGeneral} className="bg-black text-white hover:bg-slate-800 shadow-neo">
                                    <Save className="w-5 h-5 mr-2" /> 저장하기
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'test' && (
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-6 max-w-2xl">
                        <h2 className="text-2xl font-black mb-6 flex items-center">
                            <SettingsIcon className="w-6 h-6 mr-2" /> 시험 기본 설정
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-bold mb-1">기본 합격 점수</label>
                                    <div className="flex items-center">
                                        <Input
                                            type="number"
                                            value={testConfig.passingScore}
                                            onChange={(e) => setTestConfig({ ...testConfig, passingScore: parseInt(e.target.value) })}
                                            className="w-24 text-center text-lg"
                                        />
                                        <span className="ml-2 font-bold text-lg">점</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">이 점수 이상이어야 '통과' 처리됩니다.</p>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">기본 제한 시간</label>
                                    <div className="flex items-center">
                                        <Input
                                            type="number"
                                            value={testConfig.defaultTimeLimit}
                                            onChange={(e) => setTestConfig({ ...testConfig, defaultTimeLimit: parseInt(e.target.value) })}
                                            className="w-24 text-center text-lg"
                                        />
                                        <span className="ml-2 font-bold text-lg">분</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">시험 생성 시 기본값으로 사용됩니다.</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t-2 border-slate-200">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-black hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={testConfig.showResultImmediately}
                                        onChange={(e) => setTestConfig({ ...testConfig, showResultImmediately: e.target.checked })}
                                        className="w-6 h-6 border-2 border-black"
                                    />
                                    <span className="font-bold">시험 종료 즉시 결과 보여주기</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-black hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={testConfig.allowRetake}
                                        onChange={(e) => setTestConfig({ ...testConfig, allowRetake: e.target.checked })}
                                        className="w-6 h-6 border-2 border-black"
                                    />
                                    <span className="font-bold">불합격 시 재응시 허용 (기본값)</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSaveTestConfig} className="bg-black text-white hover:bg-slate-800 shadow-neo">
                                    <Save className="w-5 h-5 mr-2" /> 설정 저장
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'security' && (
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-6 max-w-2xl">
                        <h2 className="text-2xl font-black mb-6 flex items-center">
                            <Lock className="w-6 h-6 mr-2" /> 보안 설정
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-yellow-100 border-l-4 border-black p-4 mb-4">
                                <p className="font-bold text-sm">보안을 위해 주기적으로 비밀번호를 변경해주세요.</p>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">현재 비밀번호</label>
                                <Input
                                    type="password"
                                    value={password.current}
                                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">새 비밀번호</label>
                                <Input
                                    type="password"
                                    value={password.new}
                                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">새 비밀번호 확인</label>
                                <Input
                                    type="password"
                                    value={password.confirm}
                                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button onClick={handlePasswordChange} className="bg-red-500 text-white hover:bg-red-600 shadow-neo border-black">
                                    <CheckCircle className="w-5 h-5 mr-2" /> 비밀번호 변경
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Settings;
