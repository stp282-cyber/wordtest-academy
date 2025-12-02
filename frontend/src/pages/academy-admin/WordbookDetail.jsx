import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Volume2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const WordbookDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [wordbook, setWordbook] = useState(null);
    const [words, setWords] = useState([]);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setWordbook({
                id,
                title: 'Chapter 1: Basic Greetings',
                description: 'Essential greetings and introductions for beginners.',
                level: 'Beginner'
            });
            setWords([
                { id: 1, english: 'Hello', korean: '안녕하세요', example: 'Hello, nice to meet you.' },
                { id: 2, english: 'Goodbye', korean: '안녕히 가세요', example: 'Goodbye, see you tomorrow.' },
                { id: 3, english: 'Thank you', korean: '감사합니다', example: 'Thank you for your help.' },
                { id: 4, english: 'Sorry', korean: '죄송합니다', example: 'I am sorry for being late.' },
                { id: 5, english: 'Yes', korean: '네', example: 'Yes, I understand.' },
            ]);
            setLoading(false);
        }, 1000);
    }, [id]);

    if (loading) return <div className="p-12 text-center font-bold">단어장 정보를 불러오는 중...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <Link to="/academy-admin/wordbooks">
                        <Button variant="secondary" className="p-2 border-2 border-black shadow-neo hover:shadow-neo-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-black uppercase italic">{wordbook.title}</h1>
                        <p className="text-slate-600 font-bold font-mono">{wordbook.description}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-green-400 text-black hover:bg-green-500 shadow-neo hover:shadow-neo-lg border-black">
                        <Save className="w-5 h-5 mr-2" /> 변경사항 저장
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Word List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-0 overflow-hidden">
                        <div className="p-4 border-b-4 border-black bg-slate-100 flex justify-between items-center">
                            <h3 className="font-black uppercase text-lg">단어 목록 ({words.length})</h3>
                            <Button size="sm" className="bg-black text-white hover:bg-slate-800">
                                <Plus className="w-4 h-4 mr-1" /> 단어 추가
                            </Button>
                        </div>

                        <div className="divide-y-2 divide-black">
                            {words.map((word, index) => (
                                <div key={word.id} className="p-4 hover:bg-yellow-50 transition-colors group flex items-start gap-4">
                                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black border-2 border-black shadow-neo-sm shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">영어</label>
                                            <input
                                                type="text"
                                                value={word.english}
                                                className="w-full font-black text-lg bg-transparent border-b-2 border-transparent focus:border-black focus:outline-none transition-colors"
                                                readOnly
                                            />
                                            <p className="text-sm text-slate-600 mt-1 italic">"{word.example}"</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">한글 뜻</label>
                                            <input
                                                type="text"
                                                value={word.korean}
                                                className="w-full font-bold text-lg bg-transparent border-b-2 border-transparent focus:border-black focus:outline-none transition-colors"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-blue-200 rounded border-2 border-transparent hover:border-black">
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:bg-red-200 rounded border-2 border-transparent hover:border-black">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="border-4 border-black shadow-neo bg-white">
                        <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">설정</h3>
                        <div className="space-y-4">
                            <Input label="단어장 제목" value={wordbook.title} />
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">설명</label>
                                <textarea
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm resize-none h-24"
                                    value={wordbook.description}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">난이도</label>
                                <select className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm bg-white">
                                    <option>초급</option>
                                    <option>중급</option>
                                    <option>고급</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WordbookDetail;
