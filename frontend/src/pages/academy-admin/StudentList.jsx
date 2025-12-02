import React, { useEffect, useState } from 'react';
import { Plus, Search, User, MoreVertical, Trash2, Edit } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import client from '../../api/client';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newStudent, setNewStudent] = useState({ username: '', full_name: '', password: '', phone: '' });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await client.get('/users/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const response = await client.post('/users/students', newStudent);
            setStudents([...students, response.data]);
            setShowForm(false);
            setNewStudent({ username: '', full_name: '', password: '', phone: '' });
        } catch (error) {
            console.error('Failed to create student:', error);
            alert('Failed to create student: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await client.delete(`/users/students/${id}`);
            setStudents(students.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-6 shadow-neo-lg">
                <div>
                    <h1 className="text-3xl font-black text-black mb-1 uppercase">Students</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage your student accounts</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? 'Cancel' : 'Add Student'}
                </Button>
            </div>

            {/* Add Student Form */}
            {showForm && (
                <Card className="border-2 border-black shadow-neo bg-yellow-50">
                    <h3 className="text-xl font-black text-black mb-4 uppercase">New Student Registration</h3>
                    <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Username (ID)"
                            value={newStudent.username}
                            onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                            placeholder="e.g. student123"
                            required
                        />
                        <Input
                            label="Full Name"
                            value={newStudent.full_name}
                            onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                            placeholder="e.g. John Doe"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            placeholder="Simple numeric password"
                            required
                        />
                        <Input
                            label="Phone (Optional)"
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                            placeholder="010-1234-5678"
                        />
                        <div className="md:col-span-2 flex justify-end mt-4">
                            <Button type="submit" className="bg-green-500 text-black border-black hover:bg-green-400">
                                Register Student
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
                        placeholder="Search students by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                    />
                </div>
            </div>

            {/* List */}
            <Card className="p-0 overflow-hidden bg-white border-2 border-black shadow-neo">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 border-b-2 border-black">
                            <tr>
                                <th className="p-4 font-black uppercase text-sm">Name</th>
                                <th className="p-4 font-black uppercase text-sm">Username</th>
                                <th className="p-4 font-black uppercase text-sm">Phone</th>
                                <th className="p-4 font-black uppercase text-sm">Joined</th>
                                <th className="p-4 font-black uppercase text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center font-bold">Loading students...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center font-bold text-slate-500">No students found.</td></tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 font-bold flex items-center gap-3">
                                            <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full border-2 border-black">
                                                <User className="w-4 h-4" />
                                            </div>
                                            {student.full_name}
                                        </td>
                                        <td className="p-4 font-mono text-slate-600">{student.username}</td>
                                        <td className="p-4 font-mono text-slate-600">{student.phone || '-'}</td>
                                        <td className="p-4 text-sm font-bold text-slate-500">
                                            {new Date(student.created_at || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-blue-100 rounded border-2 border-transparent hover:border-blue-500 text-blue-600">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="p-2 hover:bg-red-100 rounded border-2 border-transparent hover:border-red-500 text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default StudentList;
