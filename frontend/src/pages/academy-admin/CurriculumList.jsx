import React, { useState, useEffect } from 'react';
import { Plus, Layers, Book, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const CurriculumList = () => {
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load from LocalStorage
        const loadCurriculums = () => {
            const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');

            setCurriculums(savedCurriculums);
            setLoading(false);
        };

        loadCurriculums();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">커리큘럼 관리</h1>
                    <p className="text-slate-600 font-bold font-mono">학생들을 위한 학습 경로를 설계하세요</p>
                </div>
                <Link to="/academy-admin/curriculums/new">
                    <Button className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg">
                        <Plus className="w-5 h-5 mr-2" /> 새 커리큘럼
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center p-12 font-bold text-slate-500">커리큘럼을 불러오는 중...</div>
                ) : (
                    curriculums.map((curr) => (
                        <Link key={curr.id} to={`/academy-admin/curriculums/${curr.id}`}>
                            <Card hover className="h-full flex flex-col border-4 border-black shadow-neo hover:shadow-neo-lg transition-all group bg-white">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-300 border-2 border-black flex items-center justify-center shadow-neo-sm group-hover:rotate-12 transition-transform">
                                        <Layers className="w-6 h-6 text-black" />
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-100 rounded border-2 border-transparent hover:border-black transition-all" onClick={(e) => { e.preventDefault(); alert('Duplicate'); }}>
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-1 hover:bg-red-100 rounded border-2 border-transparent hover:border-black transition-all"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (window.confirm('정말 이 커리큘럼을 삭제하시겠습니까?')) {
                                                    const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
                                                    const newCurriculums = savedCurriculums.filter(c => c.id !== curr.id);
                                                    localStorage.setItem('curriculums', JSON.stringify(newCurriculums));

                                                    // Update state to remove from UI immediately
                                                    setCurriculums(prev => prev.filter(c => c.id !== curr.id));
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-black mb-2 line-clamp-2 group-hover:underline decoration-4 decoration-purple-300 underline-offset-4">
                                    {curr.name}
                                </h3>
                                <p className="text-sm text-slate-600 font-bold mb-4 line-clamp-2">
                                    {curr.description}
                                </p>

                                <div className="mt-auto pt-4 border-t-2 border-slate-100 flex items-center justify-between text-sm font-bold text-slate-500">
                                    <span className="flex items-center">
                                        <Book className="w-4 h-4 mr-1" /> {curr.wordbookCount} 단어장
                                    </span>
                                    <span className="font-mono text-xs">{curr.studentCount}명 수강중</span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}

                {/* Add New Card Placeholder */}
                <Link to="/academy-admin/curriculums/new" className="h-full min-h-[200px] border-4 border-black border-dashed flex flex-col items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 hover:border-solid transition-all group">
                    <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-black uppercase text-lg">새 커리큘럼 만들기</span>
                </Link>
            </div>
        </div>
    );
};

export default CurriculumList;
