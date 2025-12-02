import React, { useEffect, useState } from 'react';
import { Plus, Search, GraduationCap, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import client from '../../api/client';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await client.get('/classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            const response = await client.post('/classes', newClass);
            setClasses([...classes, response.data]);
            setShowForm(false);
            setNewClass({ name: '', description: '' });
        } catch (error) {
            console.error('Failed to create class:', error);
            alert('Failed to create class');
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-6 shadow-neo-lg">
                <div>
                    <h1 className="text-3xl font-black text-black mb-1 uppercase">Classes</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage your student groups</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? 'Cancel' : 'Create Class'}
                </Button>
            </div>

            {/* Create Class Form */}
            {showForm && (
                <Card className="border-2 border-black shadow-neo bg-purple-50">
                    <h3 className="text-xl font-black text-black mb-4 uppercase">Create New Class</h3>
                    <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Class Name"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            placeholder="e.g. Advanced Grammar A"
                            required
                        />
                        <Input
                            label="Description"
                            value={newClass.description}
                            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                            placeholder="e.g. Mon/Wed/Fri 4PM"
                        />
                        <div className="md:col-span-2 flex justify-end mt-4">
                            <Button type="submit" className="bg-purple-500 text-white border-black hover:bg-purple-600">
                                Create Class
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <Input
                        icon={Search}
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 font-bold text-slate-500">Loading classes...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((cls) => (
                        <Card key={cls.id} hover className="flex flex-col h-full border-2 border-black shadow-neo hover:shadow-neo-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-300 border-2 border-black flex items-center justify-center shadow-sm">
                                    <GraduationCap className="w-6 h-6 text-black" />
                                </div>
                                <button className="p-1 hover:bg-slate-100 border-2 border-transparent hover:border-black transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-black mb-2 uppercase line-clamp-1">{cls.name}</h3>
                            <p className="text-slate-600 text-sm font-medium mb-4 line-clamp-2 flex-1">
                                {cls.description || 'No description provided.'}
                            </p>

                            <div className="pt-4 border-t-2 border-black flex items-center justify-between mt-auto">
                                <span className="text-xs font-black bg-slate-200 px-2 py-1 border-2 border-black">
                                    {cls.student_count || 0} STUDENTS
                                </span>
                                <Link to={`/academy-admin/classes/${cls.id}`}>
                                    <span className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-2">
                                        Manage &rarr;
                                    </span>
                                </Link>
                            </div>
                        </Card>
                    ))}

                    {filteredClasses.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-slate-300 rounded-lg">
                            <p className="text-slate-500 font-bold">No classes found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassList;
