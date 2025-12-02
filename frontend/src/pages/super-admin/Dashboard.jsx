import React, { useState } from 'react';
import { Building2, Users, DollarSign, Activity, Server, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import client from '../../api/client';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className={`flex items-center p-5 border-2 border-black shadow-neo ${color}`}>
        <div className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center mr-4 shadow-sm">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="bg-white px-3 py-1 border-2 border-black shadow-neo-sm -rotate-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <h3 className="text-2xl font-black text-black">{value}</h3>
        </div>
    </Card>
);

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        adminUsername: '',
        adminPassword: '',
        adminName: '',
        adminEmail: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
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
            alert('Academy created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create academy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-6 shadow-neo-lg">
                <div>
                    <h1 className="text-4xl font-black text-black mb-1 uppercase italic">Super Admin</h1>
                    <p className="text-slate-600 font-bold font-mono">Platform Overview & Management</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="border-2 border-black shadow-neo hover:shadow-neo-lg">
                        System Logs
                    </Button>
                    <Button
                        className="shadow-neo hover:shadow-neo-lg bg-black text-white hover:bg-slate-800 border-white"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Building2 className="w-5 h-5 mr-2" /> New Academy
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Building2} label="Total Academies" value="42" color="bg-blue-200" />
                <StatCard icon={Users} label="Total Users" value="1,205" color="bg-purple-200" />
                <StatCard icon={DollarSign} label="Monthly Revenue" value="$12.5k" color="bg-green-200" />
                <StatCard icon={Activity} label="System Load" value="24%" color="bg-red-200" />
            </div>

            {/* Recent Academies & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">Recent Academies</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="neo-card flex items-center p-4 hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 bg-slate-200 border-2 border-black flex items-center justify-center font-bold mr-4">
                                    A{item}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-black uppercase">Academy Name {item}</h4>
                                    <p className="text-sm font-bold text-slate-500 font-mono">Plan: Premium • 150 Students</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 border-2 border-black bg-green-400 text-xs font-black uppercase shadow-neo-sm">
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black uppercase border-b-4 border-black inline-block pr-4">System Status</h2>
                    <Card className="border-4 border-black shadow-neo-lg bg-white p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Server className="w-6 h-6 mr-3 text-black" />
                                <span className="font-bold text-lg">API Server</span>
                            </div>
                            <span className="px-3 py-1 bg-green-500 text-white font-black border-2 border-black shadow-neo-sm">ONLINE</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Activity className="w-6 h-6 mr-3 text-black" />
                                <span className="font-bold text-lg">Database</span>
                            </div>
                            <span className="px-3 py-1 bg-green-500 text-white font-black border-2 border-black shadow-neo-sm">ONLINE</span>
                        </div>
                        <div className="w-full bg-slate-100 h-32 border-2 border-black flex items-center justify-center font-mono text-slate-400">
                            [Graph Placeholder]
                        </div>
                    </Card>
                </div>
            </div>

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
                                    isLoading={loading}
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

export default Dashboard;
