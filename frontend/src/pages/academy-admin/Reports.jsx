import React, { useState } from 'react';
import { BarChart, Calendar, Download, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Reports = () => {
    const [timeRange, setTimeRange] = useState('week');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">학원 리포트</h1>
                    <p className="text-slate-600 font-bold font-mono">학생들의 성적과 진도를 확인하세요</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm bg-white"
                    >
                        <option value="week">이번 주</option>
                        <option value="month">이번 달</option>
                        <option value="semester">이번 학기</option>
                    </select>
                    <Button className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg">
                        <Download className="w-5 h-5 mr-2" /> PDF 내보내기
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-4 border-black bg-blue-200 shadow-neo p-6">
                    <h3 className="font-black uppercase text-sm mb-2">평균 점수</h3>
                    <div className="text-4xl font-black mb-2">85.4</div>
                    <div className="flex items-center text-sm font-bold text-green-700">
                        <TrendingUp className="w-4 h-4 mr-1" /> +2.5% 지난주 대비
                    </div>
                </Card>
                <Card className="border-4 border-black bg-green-200 shadow-neo p-6">
                    <h3 className="font-black uppercase text-sm mb-2">완료율</h3>
                    <div className="text-4xl font-black mb-2">92%</div>
                    <div className="flex items-center text-sm font-bold text-green-700">
                        <TrendingUp className="w-4 h-4 mr-1" /> +5.0% 지난주 대비
                    </div>
                </Card>
                <Card className="border-4 border-black bg-yellow-200 shadow-neo p-6">
                    <h3 className="font-black uppercase text-sm mb-2">활동중인 학생</h3>
                    <div className="text-4xl font-black mb-2">45</div>
                    <div className="flex items-center text-sm font-bold text-slate-600">
                        <Users className="w-4 h-4 mr-1" /> 전체: 48명
                    </div>
                </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-4 border-black shadow-neo bg-white min-h-[300px] flex flex-col">
                    <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">점수 분포</h3>
                    <div className="flex-1 flex items-end justify-around px-4 pb-4 gap-2">
                        {[30, 45, 60, 80, 55, 70, 90].map((h, i) => (
                            <div key={i} className="w-full bg-black hover:bg-blue-500 transition-colors relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                        <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
                    </div>
                </Card>

                <Card className="border-4 border-black shadow-neo bg-white min-h-[300px]">
                    <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">우수 학생</h3>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-2 border-black hover:bg-slate-50 transition-colors">
                                <div className="flex items-center">
                                    <span className={`w-6 h-6 flex items-center justify-center font-black mr-3 ${i <= 3 ? 'text-yellow-500' : 'text-slate-400'}`}>#{i}</span>
                                    <span className="font-bold">학생 {i}</span>
                                </div>
                                <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded">9{9 - i}점</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Helper icon component since it was missing in imports
const Users = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export default Reports;
