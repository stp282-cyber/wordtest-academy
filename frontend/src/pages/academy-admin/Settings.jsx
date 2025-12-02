import React, { useState } from 'react';
import { Save, User, Bell, Building } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Settings = () => {
    const [academyInfo, setAcademyInfo] = useState({
        name: '이스턴 영어 공부방',
        contact: '010-1234-5678',
        address: '서울시 강남구 테헤란로 123'
    });

    const [adminProfile, setAdminProfile] = useState({
        name: '관리자',
        email: 'admin@eastern.com'
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">설정</h1>
                    <p className="text-slate-600 font-bold font-mono">학원 및 계정 설정을 관리하세요</p>
                </div>
                <Button className="bg-green-400 text-black hover:bg-green-500 shadow-neo hover:shadow-neo-lg border-black">
                    <Save className="w-5 h-5 mr-2" /> 변경사항 저장
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academy Info */}
                <Card className="border-4 border-black shadow-neo bg-white">
                    <div className="flex items-center mb-6 border-b-4 border-black pb-4">
                        <div className="w-12 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center mr-4 shadow-neo-sm">
                            <Building className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase">학원 정보</h3>
                    </div>
                    <div className="space-y-4">
                        <Input
                            label="학원명"
                            value={academyInfo.name}
                            onChange={(e) => setAcademyInfo({ ...academyInfo, name: e.target.value })}
                        />
                        <Input
                            label="연락처"
                            value={academyInfo.contact}
                            onChange={(e) => setAcademyInfo({ ...academyInfo, contact: e.target.value })}
                        />
                        <Input
                            label="주소"
                            value={academyInfo.address}
                            onChange={(e) => setAcademyInfo({ ...academyInfo, address: e.target.value })}
                        />
                    </div>
                </Card>

                {/* Admin Profile */}
                <Card className="border-4 border-black shadow-neo bg-white">
                    <div className="flex items-center mb-6 border-b-4 border-black pb-4">
                        <div className="w-12 h-12 bg-blue-300 border-2 border-black flex items-center justify-center mr-4 shadow-neo-sm">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase">관리자 프로필</h3>
                    </div>
                    <div className="space-y-4">
                        <Input
                            label="이름"
                            value={adminProfile.name}
                            onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                        />
                        <Input
                            label="이메일"
                            value={adminProfile.email}
                            onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                        />
                        <div className="pt-4 border-t-2 border-slate-100">
                            <Button variant="secondary" className="w-full border-2 border-black hover:bg-slate-100">
                                비밀번호 변경
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Notification Settings */}
                <Card className="border-4 border-black shadow-neo bg-white lg:col-span-2">
                    <div className="flex items-center mb-6 border-b-4 border-black pb-4">
                        <div className="w-12 h-12 bg-red-300 border-2 border-black flex items-center justify-center mr-4 shadow-neo-sm">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase">알림 설정</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border-2 border-black bg-slate-50">
                            <div>
                                <h4 className="font-bold text-lg">이메일 알림</h4>
                                <p className="text-sm text-slate-500 font-mono">주요 업데이트 및 리포트 수신</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.emailAlerts}
                                    onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 border-2 border-black"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 border-2 border-black bg-slate-50">
                            <div>
                                <h4 className="font-bold text-lg">SMS 알림</h4>
                                <p className="text-sm text-slate-500 font-mono">긴급 공지사항 문자 수신</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.smsAlerts}
                                    onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 border-2 border-black"></div>
                            </label>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
