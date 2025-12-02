import React, { useEffect, useState } from 'react';
import { Plus, Book, FileSpreadsheet, Search, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import client from '../../api/client';

const WordbookList = () => {
    const [wordbooks, setWordbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchWordbooks();
    }, []);

    const fetchWordbooks = async () => {
        try {
            const response = await client.get('/wordbooks/academy');
            setWordbooks(response.data);
        } catch (error) {
            console.error('Failed to fetch wordbooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWordbooks = wordbooks.filter(wb =>
        wb.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-6 shadow-neo-lg">
                <div>
                    <h1 className="text-3xl font-black text-black mb-1 uppercase">Wordbooks</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage your vocabulary content</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-2 border-black shadow-neo hover:shadow-neo-lg">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        Import Excel
                    </Button>
                    <Link to="/academy-admin/wordbooks/new">
                        <Button className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white">
                            <Plus className="w-5 h-5 mr-2" />
                            Create Wordbook
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <Input
                        icon={Search}
                        placeholder="Search wordbooks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 font-bold text-slate-500">Loading wordbooks...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWordbooks.map((wb) => (
                        <Card key={wb.id} hover className="flex flex-col h-full border-2 border-black shadow-neo hover:shadow-neo-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center shadow-sm">
                                    <Book className="w-6 h-6 text-black" />
                                </div>
                                <button className="p-1 hover:bg-slate-100 border-2 border-transparent hover:border-black transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-black mb-2 uppercase line-clamp-1">{wb.name}</h3>
                            <p className="text-slate-600 text-sm font-medium mb-4 line-clamp-2 flex-1">
                                {wb.description || 'No description provided.'}
                            </p>

                            <div className="pt-4 border-t-2 border-black flex items-center justify-between mt-auto">
                                <span className="text-xs font-black bg-slate-200 px-2 py-1 border-2 border-black">
                                    {wb.word_count || 0} WORDS
                                </span>
                                <Link to={`/academy-admin/wordbooks/${wb.id}`}>
                                    <span className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-2">
                                        View Details &rarr;
                                    </span>
                                </Link>
                            </div>
                        </Card>
                    ))}

                    {filteredWordbooks.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-slate-300 rounded-lg">
                            <p className="text-slate-500 font-bold">No wordbooks found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WordbookList;
