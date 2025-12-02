import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, User } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setStudents([
                { id: 1, name: '김철수', email: 'kim@test.com', class: 'Class A', progress: 85, status: 'Active' },
                { id: 2, name: '이영희', email: 'lee@test.com', class: 'Class B', progress: 92, status: 'Active' },
                { id: 3, name: '박민수', email: 'park@test.com', class: 'Class A', progress: 78, status: 'Inactive' },
                { id: 4, name: '최지우', email: 'choi@test.com', class: 'Class C', progress: 65, status: 'Active' },
                { id: 5, name: '정우성', email: 'jung@test.com', class: 'Class B', progress: 88, status: 'Active' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">Students</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage your academy students</p>
                </div>
                <Button className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg">
                    <Plus className="w-5 h-5 mr-2" /> Add Student
                </Button>
            </div>

            <Card className="border-4 border-black shadow-neo-lg p-0 overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="p-4 border-b-4 border-black bg-yellow-300 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white uppercase text-sm font-black">
                                <th className="p-4 border-r-2 border-white">Name</th>
                                <th className="p-4 border-r-2 border-white">Class</th>
                                <th className="p-4 border-r-2 border-white">Progress</th>
                                <th className="p-4 border-r-2 border-white">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold text-black">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">Loading students...</td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">No students found.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b-2 border-black hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 border-r-2 border-black">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-200 border-2 border-black rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-black">{student.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-black font-mono">{student.class}</td>
                                        <td className="p-4 border-r-2 border-black">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-3 bg-slate-200 border-2 border-black rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-400 border-r-2 border-black"
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-black">
                                            <span className={`
                                                inline-block px-2 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm
                                                ${student.status === 'Active' ? 'bg-green-300' : 'bg-red-300'}
                                            `}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 hover:bg-yellow-200 border-2 border-transparent hover:border-black transition-all">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 hover:bg-red-200 border-2 border-transparent hover:border-black transition-all">
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
