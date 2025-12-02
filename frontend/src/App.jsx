import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/layout/AuthLayout';
import Login from './pages/auth/Login';
import MainLayout from './components/layout/MainLayout';
import StudentDashboard from './pages/student/Dashboard';
import AcademyDashboard from './pages/academy-admin/Dashboard';
import WordbookList from './pages/academy-admin/WordbookList';
import WordbookDetail from './pages/academy-admin/WordbookDetail';
import StudentList from './pages/academy-admin/StudentList';
import ProgressManagement from './pages/academy-admin/ProgressManagement';
import ClassList from './pages/academy-admin/ClassList';
import ClassDetail from './pages/academy-admin/ClassDetail';
import Reports from './pages/academy-admin/Reports';
import AcademySettings from './pages/academy-admin/Settings';
import CurriculumList from './pages/academy-admin/CurriculumList';
import CurriculumDetail from './pages/academy-admin/CurriculumDetail';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import SuperAdminAcademies from './pages/super-admin/Academies';
import SuperAdminUsers from './pages/super-admin/Users';
import SuperAdminSystem from './pages/super-admin/System';
import Learning from './pages/student/Learning';
import WordTest from './pages/student/WordTest';
import Games from './pages/student/Games';
import WordMatchGame from './pages/student/WordMatch';
import SpeedTyping from './pages/student/SpeedTyping';
import StudentSettings from './pages/student/Settings';
import NoticeMessageManagement from './pages/academy-admin/NoticeMessageManagement';
import StudentMessages from './pages/student/Messages';
import { Home, Book, Trophy, Settings as SettingsIcon, Users, BookOpen, GraduationCap, TrendingUp, LayoutDashboard, Building2, Activity, Layers, BarChart2, Bell, MessageSquare } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';

const studentMenuItems = [
    { icon: Home, label: 'Dashboard', to: '/student' },
    { icon: Book, label: 'My Learning', to: '/student/learning' },
    { icon: Trophy, label: 'Games', to: '/student/games' },
    { icon: MessageSquare, label: '쪽지함', to: '/student/messages' },
    { icon: SettingsIcon, label: 'Settings', to: '/student/settings' },
];

const academyMenuItems = [
    { icon: LayoutDashboard, label: '대시보드', to: '/academy-admin' },
    { icon: BarChart2, label: '진도관리', to: '/academy-admin/progress' },
    { icon: Users, label: '학생관리', to: '/academy-admin/students' },
    { icon: Layers, label: '커리큘럼', to: '/academy-admin/curriculums' },
    { icon: BookOpen, label: '단어장관리', to: '/academy-admin/wordbooks' },
    { icon: Bell, label: '공지/쪽지 관리', to: '/academy-admin/notice-message' },
    { icon: GraduationCap, label: '반관리', to: '/academy-admin/classes' },
    { icon: TrendingUp, label: '리포트', to: '/academy-admin/reports' },
    { icon: SettingsIcon, label: '설정', to: '/academy-admin/settings' },
];

const superAdminMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/super-admin' },
    { icon: Building2, label: 'Academies', to: '/super-admin/academies' },
    { icon: Users, label: 'Users', to: '/super-admin/users' },
    { icon: Activity, label: 'System', to: '/super-admin/system' },
];

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<div>Register Placeholder</div>} />
                    </Route>

                    {/* Student Routes */}
                    <Route path="/student" element={<MainLayout menuItems={studentMenuItems} />}>
                        <Route index element={<StudentDashboard />} />
                        <Route path="learning" element={<Learning />} />
                        <Route path="test" element={<WordTest />} />
                        <Route path="games" element={<Games />} />
                        <Route path="games/match" element={<WordMatchGame />} />
                        <Route path="games/typing" element={<SpeedTyping />} />
                        <Route path="settings" element={<StudentSettings />} />
                        <Route path="messages" element={<StudentMessages />} />
                    </Route>

                    {/* Academy Admin Routes */}
                    <Route path="/academy-admin" element={<MainLayout menuItems={academyMenuItems} />}>
                        <Route index element={<AcademyDashboard />} />
                        <Route path="wordbooks" element={<WordbookList />} />
                        <Route path="wordbooks/:id" element={<WordbookDetail />} />
                        <Route path="curriculums" element={<CurriculumList />} />
                        <Route path="curriculums/:id" element={<CurriculumDetail />} />
                        <Route path="students" element={<StudentList />} />
                        <Route path="progress" element={<ProgressManagement />} />
                        <Route path="classes" element={<ClassList />} />
                        <Route path="classes/:id" element={<ClassDetail />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<AcademySettings />} />
                        <Route path="notice-message" element={<NoticeMessageManagement />} />
                    </Route>

                    {/* Super Admin Routes */}
                    <Route path="/super-admin" element={<MainLayout menuItems={superAdminMenuItems} />}>
                        <Route index element={<SuperAdminDashboard />} />
                        <Route path="academies" element={<SuperAdminAcademies />} />
                        <Route path="users" element={<SuperAdminUsers />} />
                        <Route path="system" element={<SuperAdminSystem />} />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
