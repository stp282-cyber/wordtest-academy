import React, { useState } from 'react';
import { Save, User, Lock, Bell, Volume2, Target, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Mock Data
    const [profile, setProfile] = useState({
        nickname: 'SuperStudent',
        avatar: '😎',
        email: 'student@test.com'
    });

    const [preferences, setPreferences] = useState({
        dailyGoal: 30,
        ttsSpeed: 1.0,
        soundEffects: true,
        bgMusic: false
    });

    const [notifications, setNotifications] = useState({
        homework: true,
        testResult: true,
        ranking: false
    });

    const avatars = ['😎', '🤓', '🤖', '👾', '👽', '🐶', '🐱', '🦊', '🦁', '🐯'];

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex items-center w-full p-4 font-bold border-2 border-black transition-all
                ${activeTab === id
                    ? 'bg-black text-white shadow-neo translate-x-2'
                    : 'bg-white text-black hover:bg-slate-100'}
            `}
        >
            <Icon className="w-5 h-5 mr-3" />
            {label}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-black uppercase italic">Settings</h1>
                <p className="text-slate-600 font-bold font-mono">Customize your learning experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    <TabButton id="profile" icon={User} label="Profile" />
                    <TabButton id="learning" icon={Target} label="Learning" />
                    <TabButton id="security" icon={Lock} label="Security" />
                    <TabButton id="notifications" icon={Bell} label="Notifications" />
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3">
                    <Card className="border-4 border-black shadow-neo-lg bg-white min-h-[500px]">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block pr-8 bg-yellow-300">
                                    Edit Profile
                                </h2>

                                <div className="space-y-4">
                                    <label className="block font-black text-sm uppercase">Choose Avatar</label>
                                    <div className="flex flex-wrap gap-3">
                                        {avatars.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => setProfile({ ...profile, avatar: emoji })}
                                                className={`
                                                    w-12 h-12 text-2xl flex items-center justify-center border-2 border-black rounded-full transition-all hover:scale-110
                                                    ${profile.avatar === emoji ? 'bg-yellow-300 shadow-neo' : 'bg-white hover:bg-slate-50'}
                                                `}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="Nickname"
                                        value={profile.nickname}
                                        onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                                    />
                                    <Input
                                        label="Email"
                                        value={profile.email}
                                        disabled
                                        className="bg-slate-100 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Learning Preferences */}
                        {activeTab === 'learning' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block pr-8 bg-blue-300">
                                    Learning Goals
                                </h2>

                                <div className="space-y-6">
                                    <div className="p-6 border-2 border-black bg-slate-50 shadow-neo-sm">
                                        <div className="flex justify-between mb-2">
                                            <label className="font-black uppercase">Daily Word Goal</label>
                                            <span className="font-mono font-bold text-blue-600">{preferences.dailyGoal} words</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            step="5"
                                            value={preferences.dailyGoal}
                                            onChange={(e) => setPreferences({ ...preferences, dailyGoal: parseInt(e.target.value) })}
                                            className="w-full h-4 bg-white border-2 border-black rounded-full appearance-none cursor-pointer accent-black"
                                        />
                                        <p className="text-xs font-bold text-slate-500 mt-2">Recommended: 30 words per day</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-black uppercase flex items-center">
                                            <Volume2 className="w-5 h-5 mr-2" /> Audio Settings
                                        </h3>

                                        <div className="flex items-center justify-between p-4 border-2 border-black bg-white">
                                            <span className="font-bold">TTS Speed (Reading)</span>
                                            <select
                                                value={preferences.ttsSpeed}
                                                onChange={(e) => setPreferences({ ...preferences, ttsSpeed: parseFloat(e.target.value) })}
                                                className="border-2 border-black px-2 py-1 font-mono font-bold focus:outline-none"
                                            >
                                                <option value="0.8">0.8x (Slow)</option>
                                                <option value="1.0">1.0x (Normal)</option>
                                                <option value="1.2">1.2x (Fast)</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border-2 border-black bg-white">
                                            <span className="font-bold">Sound Effects</span>
                                            <button
                                                onClick={() => setPreferences({ ...preferences, soundEffects: !preferences.soundEffects })}
                                                className={`w-12 h-6 border-2 border-black rounded-full relative transition-colors ${preferences.soundEffects ? 'bg-green-400' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white border-2 border-black rounded-full transition-transform ${preferences.soundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block pr-8 bg-red-300">
                                    Change Password
                                </h2>

                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-black uppercase border-b-4 border-black inline-block pr-8 bg-purple-300">
                                    Notifications
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { id: 'homework', label: 'New Homework Assignments' },
                                        { id: 'testResult', label: 'Test Results Available' },
                                        { id: 'ranking', label: 'Weekly Ranking Updates' }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 border-2 border-black bg-white hover:bg-slate-50 transition-colors">
                                            <span className="font-bold">{item.label}</span>
                                            <button
                                                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                                                className={`
                                                    w-8 h-8 flex items-center justify-center border-2 border-black transition-all
                                                    ${notifications[item.id] ? 'bg-black text-white' : 'bg-white text-transparent'}
                                                `}
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t-4 border-black flex justify-end">
                            <Button
                                onClick={handleSave}
                                isLoading={loading}
                                className="bg-green-400 text-black hover:bg-green-500 shadow-neo hover:shadow-neo-lg"
                            >
                                <Save className="w-5 h-5 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
