import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import client from '../../api/client';

const WordbookDetail = () => {
    const { id } = useParams();
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newWord, setNewWord] = useState({ english: '', korean: '', type: 'noun' });

    useEffect(() => {
        fetchWords();
    }, [id]);

    const fetchWords = async () => {
        try {
            const response = await client.get(`/wordbooks/${id}/words`);
            setWords(response.data);
        } catch (error) {
            console.error('Failed to fetch words:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWord = async (e) => {
        e.preventDefault();
        try {
            const response = await client.post(`/wordbooks/${id}/words`, newWord);
            setWords([...words, response.data]);
            setNewWord({ english: '', korean: '', type: 'noun' }); // Reset form
        } catch (error) {
            console.error('Failed to add word:', error);
            alert('Failed to add word');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border-4 border-black p-6 shadow-neo-lg">
                <div className="flex items-center gap-4">
                    <Link to="/academy-admin/wordbooks">
                        <Button variant="secondary" size="sm" className="border-2 border-black">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-black uppercase">Wordbook Details</h1>
                        <p className="text-slate-600 font-bold font-mono">ID: {id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Word Form */}
                <div className="lg:col-span-1">
                    <Card className="border-2 border-black shadow-neo sticky top-6">
                        <h3 className="text-xl font-black text-black mb-4 uppercase border-b-2 border-black pb-2">Add New Word</h3>
                        <form onSubmit={handleAddWord} className="space-y-4">
                            <Input
                                label="English Word"
                                value={newWord.english}
                                onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
                                placeholder="e.g. Apple"
                                required
                            />
                            <Input
                                label="Korean Meaning"
                                value={newWord.korean}
                                onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })}
                                placeholder="e.g. 사과"
                                required
                            />
                            <div>
                                <label className="block text-sm font-bold text-black mb-1 uppercase">Type</label>
                                <select
                                    className="neo-input w-full"
                                    value={newWord.type}
                                    onChange={(e) => setNewWord({ ...newWord, type: e.target.value })}
                                >
                                    <option value="noun">Noun</option>
                                    <option value="verb">Verb</option>
                                    <option value="adjective">Adjective</option>
                                    <option value="adverb">Adverb</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full bg-black text-white hover:bg-slate-800 shadow-neo border-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Word
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Word List */}
                <div className="lg:col-span-2">
                    <Card className="border-2 border-black shadow-neo bg-white">
                        <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                            <h3 className="text-xl font-black text-black uppercase">Word List ({words.length})</h3>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 font-bold">Loading words...</div>
                        ) : (
                            <div className="space-y-2">
                                {words.map((word, index) => (
                                    <div key={word.id || index} className="flex items-center justify-between p-3 border-2 border-black hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-black text-white font-bold border-2 border-black text-sm">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-black text-lg">{word.english}</p>
                                                <p className="text-sm font-bold text-slate-500">{word.korean} <span className="text-xs bg-slate-200 px-1 border border-black ml-2">{word.type}</span></p>
                                            </div>
                                        </div>
                                        <button className="text-red-500 hover:text-red-700 p-2">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {words.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 font-bold italic">
                                        No words added yet. Start adding some!
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WordbookDetail;
