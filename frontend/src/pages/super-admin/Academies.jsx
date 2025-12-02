import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MoreVertical, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import client from '../../api/client';

const Academies = () => {
    const [academies, setAcademies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        adminUsername: '',
        adminPassword: '',
        adminName: '',
        adminEmail: ''
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAcademies();
    }, []);

    const fetchAcademies = async () => {
        try {
            const response = await client.get('/academies');
            setAcademies(response.data);
        } catch (error) {
            console.error('Failed to fetch academies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setError('');

        try {
            await client.post('/academies', formData);
            setIsModalOpen(false);
            setFormData({
                name: '',
                subdomain: '',
                adminUsername: '',
                adminPassword: '',
                adminName: '',
                adminEmail: ''
            });
            fetchAcademies(); // Refresh list
            alert('Academy created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create academy');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase italic">Academies Management</h1>
                    <p className="text-slate-600 font-bold font-mono">Manage all registered academies</p>
                </div>
                <Button
                    className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-5 h-5 mr-2" /> New Academy
                </Button>
            </div>

            <Card className="border-4 border-black shadow-neo-lg bg-white overflow-hidden">
                <div className="p-4 border-b-2 border-black bg-slate-50 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search academies..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black font-bold"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="border-2 border-black px-3 py-2 font-bold focus:outline-none">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b-2 border-black text-sm uppercase font-black tracking-wider">
                                <th className="p-4 border-r-2 border-slate-200">Academy Name</th>
                                <th className="p-4 border-r-2 border-slate-200">Subdomain</th>
                                <th className="p-4 border-r-2 border-slate-200">Plan</th>
                                <th className="p-4 border-r-2 border-slate-200">Status</th>
                                <th className="p-4 border-r-2 border-slate-200">Created At</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 font-bold">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">Loading academies...</td>
                                </tr>
                            ) : academies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No academies found. Create one to get started.</td>
                                </tr>
                            ) : (
                                academies.map((academy) => (
                                    <tr key={academy.ID} className="hover:bg-yellow-50 transition-colors">
                                        <td className="p-4 border-r-2 border-slate-100">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black mr-3 border-2 border-white shadow-sm">
                                                    {academy.NAME.charAt(0)}
                                                </div>
                                                {academy.NAME}
                                            </div>
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100 font-mono text-sm text-slate-600">
                                            {academy.SUBDOMAIN}.wordtest.com
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs uppercase border-2 border-purple-200">
                                                {academy.PLAN || 'Free'}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100">
                                            <span className={`px-2 py-1 text-xs uppercase border-2 ${academy.STATUS === 'active'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                {academy.STATUS || 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r-2 border-slate-100 text-sm text-slate-500">
                                            {new Date(academy.CREATED_AT).toLocaleDateString()}
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

            {/* Create Academy Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl bg-white border-4 border-black shadow-neo-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-yellow-300">
                            <h2 className="text-2xl font-black uppercase flex items-center">
                                <Building2 className="w-6 h-6 mr-3" />
                                Create New Academy
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-black hover:text-white border-2 border-black transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-black text-lg border-b-2 border-black inline-block">Academy Details</h3>
                                    <Input
                                        label="Academy Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Eastern English"
                                    />
                                    <Input
                                        label="Subdomain"
                                        name="subdomain"
                                        value={formData.subdomain}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. eastern"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-black text-lg border-b-2 border-black inline-block">Admin Account</h3>
                                    <Input
                                        label="Admin Username"
                                        name="adminUsername"
                                        value={formData.adminUsername}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. eastern_admin"
                                    />
                                    <Input
                                        label="Admin Password"
                                        name="adminPassword"
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <Input
                                        label="Admin Name"
                                        name="adminName"
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                    />
                                    <Input
                                        label="Admin Email"
                                        name="adminEmail"
                                        type="email"
                                        value={formData.adminEmail}
                                        onChange={handleChange}
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t-2 border-slate-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="mr-4"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={createLoading}
                                    className="bg-green-400 hover:bg-green-500 text-black border-black shadow-neo hover:shadow-neo-lg"
                                >
                                    Create Academy
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Academies;
