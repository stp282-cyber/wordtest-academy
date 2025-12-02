import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, User, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import client from '../../api/client';

const ClassDetail = () => {
    const { id } = useParams();
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allStudents, setAllStudents] = useState([]); // For selection
    const [selectedStudentId, setSelectedStudentId] = useState('');

    useEffect(() => {
        fetchClassData();
        fetchStudents();
        fetchAllStudents();
    }, [id]);

    const fetchClassData = async () => {
        // In a real app, we'd have a specific endpoint for class details or filter from list
        // For now, let's assume we can get it or just use the ID
        // setClassData({ id, name: 'Class Name' }); 
    };

    const fetchStudents = async () => {
        try {
            const response = await client.get(`/classes/${id}/students`);
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch class students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const response = await client.get('/users/students');
            setAllStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch all students:', error);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!selectedStudentId) return;
        try {
            await client.post(`/classes/${id}/students`, { studentId: selectedStudentId });
            // Refresh list
            fetchStudents();
            setSelectedStudentId('');
        } catch (error) {
            console.error('Failed to add student to class:', error);
            alert('Failed to add student');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border-4 border-black p-6 shadow-neo-lg">
                <div className="flex items-center gap-4">
                    <Link to="/academy-admin/classes">
                        <Button variant="secondary" size="sm" className="border-2 border-black">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-black uppercase">Class Management</h1>
                        <p className="text-slate-600 font-bold font-mono">ID: {id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Student Form */}
                <div className="lg:col-span-1">
                    <Card className="border-2 border-black shadow-neo sticky top-6">
                        <h3 className="text-xl font-black text-black mb-4 uppercase border-b-2 border-black pb-2">Add Student</h3>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-black mb-1 uppercase">Select Student</label>
                                <select
                                    className="neo-input w-full"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                >
                                    <option value="">-- Select a student --</option>
                                    {allStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name} ({s.username})</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" className="w-full bg-black text-white hover:bg-slate-800 shadow-neo border-white">
                                <Plus className="w-4 h-4 mr-2" /> Add to Class
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Student List */}
                <div className="lg:col-span-2">
                    <Card className="border-2 border-black shadow-neo bg-white">
                        <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                            <h3 className="text-xl font-black text-black uppercase">Enrolled Students ({students.length})</h3>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 font-bold">Loading students...</div>
                        ) : (
                            <div className="space-y-2">
                                {students.map((student, index) => (
                                    <div key={student.id || index} className="flex items-center justify-between p-3 border-2 border-black hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-slate-200 flex items-center justify-center rounded-full border-2 border-black">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg">{student.full_name}</p>
                                                <p className="text-sm font-bold text-slate-500">{student.username}</p>
                                            </div>
                                        </div>
                                        <button className="text-red-500 hover:text-red-700 p-2">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {students.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 font-bold italic">
                                        No students in this class yet.
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

export default ClassDetail;
