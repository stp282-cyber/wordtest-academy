import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, HardDrive, Cpu, MemoryStick, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';

const System = () => {
    const [systemStats, setSystemStats] = useState({
        status: 'operational',
        uptime: '15 days, 3 hours',
        version: '1.0.0',
        lastUpdate: '2025-12-01',
        database: {
            status: 'connected',
            type: 'Oracle DB',
            connections: 12,
            maxConnections: 100
        },
        server: {
            cpu: 45,
            memory: 62,
            disk: 38,
            requests: 1250
        },
        services: [
            { name: 'API Server', status: 'running', port: 5000 },
            { name: 'Database', status: 'running', port: 1521 },
            { name: 'WebSocket', status: 'running', port: 5000 },
            { name: 'Cache Service', status: 'running', port: 6379 }
        ]
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'running':
            case 'operational':
            case 'connected':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'error':
            case 'stopped':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'running':
            case 'operational':
            case 'connected':
                return <CheckCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5" />;
            case 'error':
            case 'stopped':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Activity className="w-5 h-5" />;
        }
    };

    const getUsageColor = (percentage) => {
        if (percentage < 50) return 'bg-green-400';
        if (percentage < 75) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-black uppercase italic">System Status</h1>
                <p className="text-slate-600 font-bold font-mono">Monitor system health and performance</p>
            </div>

            {/* Overall Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-4 border-black shadow-neo-lg bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase">System Status</p>
                            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 text-sm uppercase border-2 font-black ${getStatusColor(systemStats.status)}`}>
                                {getStatusIcon(systemStats.status)}
                                {systemStats.status}
                            </div>
                        </div>
                        <Activity className="w-10 h-10 text-green-500" />
                    </div>
                </Card>

                <Card className="border-4 border-black shadow-neo-lg bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase">Uptime</p>
                            <p className="text-2xl font-black mt-2">{systemStats.uptime}</p>
                        </div>
                        <Clock className="w-10 h-10 text-blue-500" />
                    </div>
                </Card>

                <Card className="border-4 border-black shadow-neo-lg bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase">Version</p>
                            <p className="text-2xl font-black mt-2">{systemStats.version}</p>
                        </div>
                        <Server className="w-10 h-10 text-purple-500" />
                    </div>
                </Card>

                <Card className="border-4 border-black shadow-neo-lg bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase">Requests/min</p>
                            <p className="text-2xl font-black mt-2">{systemStats.server.requests}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-orange-500" />
                    </div>
                </Card>
            </div>

            {/* Server Resources */}
            <Card className="border-4 border-black shadow-neo-lg bg-white">
                <div className="p-6 border-b-4 border-black bg-slate-50">
                    <h2 className="text-xl font-black uppercase flex items-center">
                        <Server className="w-6 h-6 mr-3" />
                        Server Resources
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* CPU Usage */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-slate-600" />
                                <span className="font-black uppercase text-sm">CPU Usage</span>
                            </div>
                            <span className="font-black text-lg">{systemStats.server.cpu}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-200 border-2 border-black">
                            <div
                                className={`h-full ${getUsageColor(systemStats.server.cpu)} transition-all duration-300`}
                                style={{ width: `${systemStats.server.cpu}%` }}
                            />
                        </div>
                    </div>

                    {/* Memory Usage */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <MemoryStick className="w-5 h-5 text-slate-600" />
                                <span className="font-black uppercase text-sm">Memory Usage</span>
                            </div>
                            <span className="font-black text-lg">{systemStats.server.memory}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-200 border-2 border-black">
                            <div
                                className={`h-full ${getUsageColor(systemStats.server.memory)} transition-all duration-300`}
                                style={{ width: `${systemStats.server.memory}%` }}
                            />
                        </div>
                    </div>

                    {/* Disk Usage */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-slate-600" />
                                <span className="font-black uppercase text-sm">Disk Usage</span>
                            </div>
                            <span className="font-black text-lg">{systemStats.server.disk}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-200 border-2 border-black">
                            <div
                                className={`h-full ${getUsageColor(systemStats.server.disk)} transition-all duration-300`}
                                style={{ width: `${systemStats.server.disk}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Status */}
                <Card className="border-4 border-black shadow-neo-lg bg-white">
                    <div className="p-6 border-b-4 border-black bg-slate-50">
                        <h2 className="text-xl font-black uppercase flex items-center">
                            <Database className="w-6 h-6 mr-3" />
                            Database
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-600">Status</span>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs uppercase border-2 font-black ${getStatusColor(systemStats.database.status)}`}>
                                {getStatusIcon(systemStats.database.status)}
                                {systemStats.database.status}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-600">Type</span>
                            <span className="font-black">{systemStats.database.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-600">Active Connections</span>
                            <span className="font-black">{systemStats.database.connections} / {systemStats.database.maxConnections}</span>
                        </div>
                        <div>
                            <div className="w-full h-3 bg-slate-200 border-2 border-black mt-2">
                                <div
                                    className="h-full bg-blue-400 transition-all duration-300"
                                    style={{ width: `${(systemStats.database.connections / systemStats.database.maxConnections) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Services Status */}
                <Card className="border-4 border-black shadow-neo-lg bg-white">
                    <div className="p-6 border-b-4 border-black bg-slate-50">
                        <h2 className="text-xl font-black uppercase flex items-center">
                            <Activity className="w-6 h-6 mr-3" />
                            Services
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {systemStats.services.map((service, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-200">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(service.status)}
                                        <div>
                                            <p className="font-black text-sm">{service.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">Port: {service.port}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 text-xs uppercase border-2 font-black ${getStatusColor(service.status)}`}>
                                        {service.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* System Information */}
            <Card className="border-4 border-black shadow-neo-lg bg-white">
                <div className="p-6 border-b-4 border-black bg-slate-50">
                    <h2 className="text-xl font-black uppercase flex items-center">
                        <Server className="w-6 h-6 mr-3" />
                        System Information
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase mb-2">Platform</p>
                            <p className="font-black text-lg">Node.js + React</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase mb-2">Environment</p>
                            <p className="font-black text-lg">Production</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-600 uppercase mb-2">Last Update</p>
                            <p className="font-black text-lg">{systemStats.lastUpdate}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default System;
