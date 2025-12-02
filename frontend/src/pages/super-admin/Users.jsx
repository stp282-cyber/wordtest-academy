import React, { useState, useEffect } from 'react';
import { Users, Search, MoreVertical, Shield, Mail } from 'lucide-react';
import Card from '../../components/common/Card';
import client from '../../api/client';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await client.get('/users');
            console.log('Users response:', response.data);
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error('Users data is not an array:', response.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">Users Management</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage all platform users</p>
                </div>
            </div>

            <Card className="border-4 border-black shadow-neo-lg bg-white overflow-hidden">
                <div className="p-4 border-b-2 border-black bg-slate-50 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black font-bold"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="border-2 border-black px-3 py-2 font-bold focus:outline-none">
                            <option>All Roles</option>
                            <option>Super Admin</option>
                            <option>Academy Admin</option>
                            <option>Student</option>
                            <option>Teacher</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b-2 border-black text-sm uppercase font-black tracking-wider">
                                <th className="p-4 border-r-2 border-slate-200">User</th>
                                <th className="p-4 border-r-2 border-slate-200">Role</th>
                                <th className="p-4 border-r-2 border-slate-200">Academy ID</th>
                                <th className="p-4 border-r-2 border-slate-200">Status</th>
                                <th className="p-4 border-r-2 border-slate-200">Created At</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 font-bold">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-yellow-50 transition-colors">
                                        <td className="p-4 border-r-2 border-slate-100">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black mr-3 border-2 border-white shadow-sm rounded-full">
                                                    {user.full_name ? user.full_name.charAt(0) : user.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-black">{user.full_name || user.username}</div>
                                                    <div className="text-xs text-slate-500 font-mono flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {user.email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100">
                                            <span className={`px-2 py-1 text-xs uppercase border-2 flex items-center w-fit ${user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700 border-red-200' :
                                                user.role === 'ACADEMY_ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    'bg-blue-100 text-blue-700 border-blue-200'
                                                }`}>
                                                <Shield className="w-3 h-3 mr-1" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100 font-mono text-sm text-slate-600">
                                            {user.academy_id || '-'}
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100">
                                            <span className={`px-2 py-1 text-xs uppercase border-2 ${user.status === 'active'
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100 text-sm text-slate-500">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4">
                                            <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                                <MoreVertical className="w-5 h-5 text-slate-500" />
                                            </button>
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

export default UsersPage;
