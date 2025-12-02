import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, X, Book } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CurriculumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [curriculum, setCurriculum] = useState(null);
    const [items, setItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableWordbooks, setAvailableWordbooks] = useState([]);

    useEffect(() => {
        // Load Wordbooks from LocalStorage
        const loadData = () => {
            const savedWordbooks = localStorage.getItem('wordbooks');
            if (savedWordbooks) {
                const parsedWordbooks = JSON.parse(savedWordbooks);
                // Enhance wordbooks with stats
                const enhancedWordbooks = parsedWordbooks.map(wb => {
                    const savedWords = localStorage.getItem(`wordbook_words_${wb.id}`);
                    const words = savedWords ? JSON.parse(savedWords) : [];
                    const uniqueUnits = new Set(words.map(w => w.minor).filter(Boolean));
                    return {
                        ...wb,
                        realCount: words.length,
                        unitCount: uniqueUnits.size || 1, // Avoid division by zero
                        wordsPerUnit: words.length / (uniqueUnits.size || 1)
                    };
                });
                setAvailableWordbooks(enhancedWordbooks);
            }

            // Mock Curriculum Data (since we don't have a full backend for this yet)
            // Mock Curriculum Data (since we don't have a full backend for this yet)
            if (id === 'new') {
                setCurriculum({
                    id: 'new',
                    name: '새 커리큘럼',
                    description: '새로운 커리큘럼을 생성합니다.'
                });
                setItems([]);
            } else {
                // Try to find in localStorage first
                const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
                const found = savedCurriculums.find(c => c.id === parseInt(id));

                if (found) {
                    setCurriculum(found);
                    setItems(found.items || []);
                } else {
                    // Fallback to mock if not found (for legacy/demo purposes)
                    setCurriculum({
                        id,
                        name: 'Standard Beginner Course',
                        description: 'A comprehensive course for absolute beginners.'
                    });
                    setItems([
                        {
                            id: 1,
                            wordbookId: 101, // Mock ID
                            title: 'Chapter 1: Basic Greetings (Mock)',
                            settings: { testType: 'typing', wordCount: 10, passScore: 100, dailyGoal: 'manual' }
                        }
                    ]);
                }
            }
            setLoading(false);
        };

        loadData();
    }, [id]);

    const handleSave = () => {
        const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');

        const newCurriculum = {
            ...curriculum,
            id: id === 'new' ? Date.now() : parseInt(id),
            items: items,
            wordbookCount: items.length,
            studentCount: 0, // Default for new
            created: new Date().toISOString().split('T')[0]
        };

        if (id === 'new') {
            savedCurriculums.push(newCurriculum);
        } else {
            const index = savedCurriculums.findIndex(c => c.id === parseInt(id));
            if (index !== -1) {
                savedCurriculums[index] = newCurriculum;
            } else {
                // If editing a mock one that's not in storage yet, add it
                savedCurriculums.push(newCurriculum);
            }
        }

        localStorage.setItem('curriculums', JSON.stringify(savedCurriculums));
        alert('커리큘럼이 저장되었습니다.');
        navigate('/academy-admin/curriculums');
    };

    const handleAddItem = (wordbook) => {
        const newItem = {
            id: Date.now(),
            wordbookId: wordbook.id,
            title: wordbook.title,
            // Store stats for calculation
            stats: {
                totalWords: wordbook.realCount,
                unitCount: wordbook.unitCount,
                wordsPerUnit: wordbook.wordsPerUnit
            },
            settings: {
                testType: 'typing',
                wordCount: Math.round(wordbook.wordsPerUnit), // Default to 1 unit
                passScore: 100,
                dailyGoal: '1_unit' // Default to 1 unit
            }
        };
        setItems([...items, newItem]);
        setShowAddModal(false);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSettingChange = (index, field, value) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'dailyGoal') {
            item.settings.dailyGoal = value;
            if (value !== 'manual' && item.stats) {
                let multiplier = 1;
                if (value === '0.5_unit') multiplier = 0.5;
                if (value === '2_units') multiplier = 2;

                // Calculate new word count
                item.settings.wordCount = Math.round(item.stats.wordsPerUnit * multiplier);
            }
        } else if (field === 'wordCount') {
            item.settings.wordCount = value;
            // If manually changed, set dailyGoal to manual
            item.settings.dailyGoal = 'manual';
        } else {
            item.settings[field] = value;
        }

        setItems(newItems);
    };

    const moveItem = (index, direction) => {
        if (direction === 'up' && index > 0) {
            const newItems = [...items];
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            setItems(newItems);
        } else if (direction === 'down' && index < items.length - 1) {
            const newItems = [...items];
            [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
            setItems(newItems);
        }
    };

    if (loading) return <div className="p-12 text-center font-bold">커리큘럼 정보를 불러오는 중...</div>;

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <Link to="/academy-admin/curriculums">
                        <Button variant="secondary" className="p-2 border-2 border-black shadow-neo hover:shadow-neo-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-black uppercase italic">{curriculum.name}</h1>
                        <p className="text-slate-600 font-bold font-mono">{curriculum.description}</p>
                    </div>
                </div>
                <Button onClick={handleSave} className="bg-green-400 text-black hover:bg-green-500 shadow-neo hover:shadow-neo-lg border-black">
                    <Save className="w-5 h-5 mr-2" /> 변경사항 저장
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Curriculum Items List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-0 overflow-hidden">
                        <div className="p-4 border-b-4 border-black bg-purple-200 flex justify-between items-center">
                            <h3 className="font-black uppercase text-lg flex items-center">
                                <GripVertical className="w-5 h-5 mr-2" /> 학습 경로 ({items.length} 단계)
                            </h3>
                            <Button size="sm" className="bg-black text-white hover:bg-slate-800" onClick={() => setShowAddModal(true)}>
                                <Plus className="w-4 h-4 mr-1" /> 단어장 추가
                            </Button>
                        </div>

                        <div className="divide-y-2 divide-black">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 font-bold">
                                    등록된 단어장이 없습니다. "단어장 추가" 버튼을 눌러 커리큘럼을 만들어보세요.
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center justify-center gap-1 pt-1">
                                                <button
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                                                >
                                                    ▲
                                                </button>
                                                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black border-2 border-black shadow-neo-sm">
                                                    {index + 1}
                                                </div>
                                                <button
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === items.length - 1}
                                                    className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                                                >
                                                    ▼
                                                </button>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-black text-lg">{item.title}</h4>
                                                    <button
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Settings Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-100 p-3 border-2 border-black/10 rounded">
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">시험 방식</label>
                                                        <select
                                                            value={item.settings.testType}
                                                            onChange={(e) => handleSettingChange(index, 'testType', e.target.value)}
                                                            className="w-full p-1 border-2 border-black text-sm font-bold focus:outline-none"
                                                        >
                                                            <option value="typing">타자 연습 (한글)</option>
                                                            <option value="scramble_select">순서 섞기 (선택)</option>
                                                            <option value="scramble_typing">순서 섞기 (타자)</option>
                                                            <option value="choice">객관식</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">일일 학습량</label>
                                                        <select
                                                            value={item.settings.dailyGoal || 'manual'}
                                                            onChange={(e) => handleSettingChange(index, 'dailyGoal', e.target.value)}
                                                            className="w-full p-1 border-2 border-black text-sm font-bold focus:outline-none"
                                                        >
                                                            <option value="manual">직접 입력</option>
                                                            <option value="0.5_unit">0.5 소단원</option>
                                                            <option value="1_unit">1 소단원</option>
                                                            <option value="2_units">2 소단원</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">단어 수</label>
                                                        <input
                                                            type="number"
                                                            value={item.settings.wordCount}
                                                            onChange={(e) => handleSettingChange(index, 'wordCount', parseInt(e.target.value))}
                                                            disabled={item.settings.dailyGoal && item.settings.dailyGoal !== 'manual'}
                                                            className={`w-full p-1 border-2 border-black text-sm font-bold focus:outline-none ${item.settings.dailyGoal && item.settings.dailyGoal !== 'manual'
                                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                                : 'bg-white'
                                                                }`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">통과 점수</label>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="number"
                                                                value={item.settings.passScore}
                                                                onChange={(e) => handleSettingChange(index, 'passScore', parseInt(e.target.value))}
                                                                className="w-full p-1 border-2 border-black text-sm font-bold focus:outline-none"
                                                            />
                                                            <span className="ml-1 font-bold">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="border-4 border-black shadow-neo bg-white">
                        <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">커리큘럼 정보</h3>
                        <div className="space-y-4">
                            <Input label="커리큘럼 이름" value={curriculum.name} onChange={(e) => setCurriculum({ ...curriculum, name: e.target.value })} />
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">설명</label>
                                <textarea
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm resize-none h-32"
                                    value={curriculum.description}
                                    onChange={(e) => setCurriculum({ ...curriculum, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-4 border-black shadow-neo bg-yellow-100">
                        <h3 className="font-black uppercase text-lg mb-2">진행 방식</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm font-bold text-slate-700">
                            <li>학생들은 순서대로 단어장을 학습합니다.</li>
                            <li>현재 단어장을 통과해야 다음 단어장이 열립니다.</li>
                            <li>각 단계별로 다른 시험 방식을 설정할 수 있습니다.</li>
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Add Wordbook Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg bg-white border-4 border-black shadow-neo-lg p-0">
                        <div className="p-4 border-b-4 border-black bg-yellow-300 flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">단어장 선택</h3>
                            <button onClick={() => setShowAddModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                            {availableWordbooks.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 font-bold">
                                    사용 가능한 단어장이 없습니다.<br />
                                    단어장 관리 메뉴에서 먼저 단어장을 만들어주세요.
                                </div>
                            ) : (
                                availableWordbooks.map(wb => (
                                    <button
                                        key={wb.id}
                                        onClick={() => handleAddItem(wb)}
                                        className="w-full text-left p-4 border-2 border-black hover:bg-slate-100 hover:shadow-neo-sm transition-all flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-black text-lg">{wb.title}</div>
                                            <div className="text-xs font-mono text-slate-500">
                                                {wb.realCount} words • {wb.unitCount} units
                                                <span className="ml-2 text-blue-600">
                                                    (Avg {Math.round(wb.wordsPerUnit)}/unit)
                                                </span>
                                            </div>
                                        </div>
                                        <Plus className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CurriculumDetail;
