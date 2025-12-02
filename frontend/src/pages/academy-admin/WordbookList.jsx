import React, { useState, useEffect } from 'react';
import { Plus, Search, Book, Upload, FileText, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const WordbookList = () => {
    const [wordbooks, setWordbooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setWordbooks([
                { id: 1, title: 'Chapter 1: Basic Greetings', count: 20, level: 'Beginner', created: '2024-11-01' },
                { id: 2, title: 'Chapter 2: Numbers & Colors', count: 25, level: 'Beginner', created: '2024-11-05' },
                { id: 3, title: 'Chapter 3: Family Members', count: 18, level: 'Intermediate', created: '2024-11-10' },
                { id: 4, title: 'Chapter 4: Food & Drinks', count: 30, level: 'Intermediate', created: '2024-11-15' },
                { id: 5, title: 'Chapter 5: Travel Essentials', count: 40, level: 'Advanced', created: '2024-11-20' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">단어장 관리</h1>
                    <p className="text-slate-600 font-bold font-mono">학습 콘텐츠를 관리하세요</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-2 border-black shadow-neo hover:shadow-neo-lg bg-white">
                        <Upload className="w-5 h-5 mr-2" /> 엑셀 업로드
                    </Button>
                    <Button className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg">
                        <Plus className="w-5 h-5 mr-2" /> 새 단어장
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center p-12 font-bold text-slate-500">단어장을 불러오는 중...</div>
                ) : (
                    wordbooks.map((wb) => (
                        <Link key={wb.id} to={`/academy-admin/wordbooks/${wb.id}`}>
                            <Card hover className="h-full flex flex-col border-4 border-black shadow-neo hover:shadow-neo-lg transition-all group bg-white">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center shadow-neo-sm group-hover:rotate-12 transition-transform">
                                        <Book className="w-6 h-6 text-black" />
                                    </div>
                                    <span className={`
                                        px-2 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm
                                        ${wb.level === 'Beginner' ? 'bg-green-300' : wb.level === 'Intermediate' ? 'bg-blue-300' : 'bg-red-300'}
                                    `}>
                                        {wb.level === 'Beginner' ? '초급' : wb.level === 'Intermediate' ? '중급' : '고급'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-black mb-2 line-clamp-2 group-hover:underline decoration-4 decoration-yellow-300 underline-offset-4">
                                    {wb.title}
                                </h3>

                                <div className="mt-auto pt-4 border-t-2 border-slate-100 flex items-center justify-between text-sm font-bold text-slate-500">
                                    <span className="flex items-center">
                                        <FileText className="w-4 h-4 mr-1" /> {wb.count} 단어
                                    </span>
                                    <span className="font-mono text-xs">{wb.created}</span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}

                {/* Add New Card Placeholder */}
                <button className="h-full min-h-[200px] border-4 border-black border-dashed flex flex-col items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 hover:border-solid transition-all group">
                    <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-black uppercase text-lg">새 단어장 만들기</span>
                </button>
            </div>
        </div>
    );
};

export default WordbookList;
