import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Settings, Book } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CurriculumDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [curriculum, setCurriculum] = useState(null);
    const [items, setItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock Data for Available Wordbooks
    const availableWordbooks = [
        { id: 101, title: 'Chapter 1: Basic Greetings', count: 20 },
        { id: 102, title: 'Chapter 2: Numbers & Colors', count: 25 },
        { id: 103, title: 'Chapter 3: Family Members', count: 18 },
        { id: 104, title: 'Chapter 4: Food & Drinks', count: 30 },
        { id: 105, title: 'Chapter 5: Travel Essentials', count: 40 },
    ];

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setCurriculum({
                id,
                name: 'Standard Beginner Course',
                description: 'A comprehensive course for absolute beginners.'
            });
            setItems([
                {
                    id: 1,
                    wordbookId: 101,
                    title: 'Chapter 1: Basic Greetings',
                    settings: { testType: 'typing', wordCount: 10, passScore: 80 }
                },
                {
                    id: 2,
                    wordbookId: 102,
                    title: 'Chapter 2: Numbers & Colors',
                    settings: { testType: 'scramble_select', wordCount: 15, passScore: 80 }
                },
                {
                    id: 3,
                    wordbookId: 103,
                    title: 'Chapter 3: Family Members',
                    settings: { testType: 'scramble_typing', wordCount: 10, passScore: 90 }
                },
            ]);
            setLoading(false);
        }, 1000);
    }, [id]);

    const handleAddItem = (wordbook) => {
        const newItem = {
            id: Date.now(), // Temporary ID
            wordbookId: wordbook.id,
            title: wordbook.title,
            settings: { testType: 'typing', wordCount: 20, passScore: 80 } // Default settings
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
        newItems[index].settings[field] = value;
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

    if (loading) return <div className="p-12 text-center font-bold">Loading curriculum...</div>;

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
                <Button className="bg-green-400 text-black hover:bg-green-500 shadow-neo hover:shadow-neo-lg border-black">
                    <Save className="w-5 h-5 mr-2" /> Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Curriculum Items List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-0 overflow-hidden">
                        <div className="p-4 border-b-4 border-black bg-purple-200 flex justify-between items-center">
                            <h3 className="font-black uppercase text-lg flex items-center">
                                <GripVertical className="w-5 h-5 mr-2" /> Learning Path ({items.length} Steps)
                            </h3>
                            <Button size="sm" className="bg-black text-white hover:bg-slate-800" onClick={() => setShowAddModal(true)}>
                                <Plus className="w-4 h-4 mr-1" /> Add Wordbook
                            </Button>
                        </div>

                        <div className="divide-y-2 divide-black">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 font-bold">
                                    No wordbooks added yet. Click "Add Wordbook" to start building the curriculum.
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
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-100 p-3 border-2 border-black/10 rounded">
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">Test Type</label>
                                                        <select
                                                            value={item.settings.testType}
                                                            onChange={(e) => handleSettingChange(index, 'testType', e.target.value)}
                                                            className="w-full p-1 border-2 border-black text-sm font-bold focus:outline-none"
                                                        >
                                                            <option value="typing">Typing (KOR)</option>
                                                            <option value="scramble_select">Scramble (Select)</option>
                                                            <option value="scramble_typing">Scramble (Type)</option>
                                                            <option value="choice">Multiple Choice</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">Word Count</label>
                                                        <input
                                                            type="number"
                                                            value={item.settings.wordCount}
                                                            onChange={(e) => handleSettingChange(index, 'wordCount', parseInt(e.target.value))}
                                                            className="w-full p-1 border-2 border-black text-sm font-bold focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black uppercase text-slate-500 mb-1">Pass Score</label>
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
                        <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">Curriculum Info</h3>
                        <div className="space-y-4">
                            <Input label="Curriculum Name" value={curriculum.name} onChange={(e) => setCurriculum({ ...curriculum, name: e.target.value })} />
                            <div>
                                <label className="block text-sm font-black mb-1 uppercase">Description</label>
                                <textarea
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm resize-none h-32"
                                    value={curriculum.description}
                                    onChange={(e) => setCurriculum({ ...curriculum, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-4 border-black shadow-neo bg-yellow-100">
                        <h3 className="font-black uppercase text-lg mb-2">How it works</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm font-bold text-slate-700">
                            <li>Students proceed through wordbooks in order.</li>
                            <li>Next wordbook unlocks only after passing the current one.</li>
                            <li>You can set different test types for each stage.</li>
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Add Wordbook Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg bg-white border-4 border-black shadow-neo-lg p-0">
                        <div className="p-4 border-b-4 border-black bg-yellow-300 flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">Select Wordbook</h3>
                            <button onClick={() => setShowAddModal(false)}>
                                <Settings className="w-6 h-6 rotate-45" /> {/* Using Settings icon as Close for now or just X */}
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                            {availableWordbooks.map(wb => (
                                <button
                                    key={wb.id}
                                    onClick={() => handleAddItem(wb)}
                                    className="w-full text-left p-4 border-2 border-black hover:bg-slate-100 hover:shadow-neo-sm transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-black text-lg">{wb.title}</div>
                                        <div className="text-xs font-mono text-slate-500">{wb.count} words</div>
                                    </div>
                                    <Plus className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CurriculumDetail;
