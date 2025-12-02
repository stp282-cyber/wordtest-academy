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
import ClassList from './pages/academy-admin/ClassList';
import ClassDetail from './pages/academy-admin/ClassDetail';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import SuperAdminAcademies from './pages/super-admin/Academies';
import SuperAdminUsers from './pages/super-admin/Users';
import Learning from './pages/student/Learning';
import Games from './pages/student/Games';
import WordMatchGame from './pages/student/WordMatch';
import { Home, Book, Trophy, Settings, Users, BookOpen, GraduationCap, TrendingUp, LayoutDashboard, Building2, Activity } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';

const studentMenuItems = [
    { icon: Home, label: 'Dashboard', to: '/student' },
    { icon: Book, label: 'My Learning', to: '/student/learning' },
    { icon: Trophy, label: 'Games', to: '/student/games' },
    { icon: Settings, label: 'Settings', to: '/student/settings' },
];

const academyMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/academy-admin' },
    { icon: Users, label: 'Students', to: '/academy-admin/students' },
    { icon: BookOpen, label: 'Wordbooks', to: '/academy-admin/wordbooks' },
    { icon: GraduationCap, label: 'Classes', to: '/academy-admin/classes' },
    { icon: TrendingUp, label: 'Reports', to: '/academy-admin/reports' },
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
                        <Route path="games" element={<Games />} />
                        <Route path="games/match" element={<WordMatchGame />} />
                    </Route>

                    {/* Academy Admin Routes */}
                    <Route path="/academy-admin" element={<MainLayout menuItems={academyMenuItems} />}>
                        <Route index element={<AcademyDashboard />} />
                        <Route path="wordbooks" element={<WordbookList />} />
                        <Route path="wordbooks/:id" element={<WordbookDetail />} />
                        <Route path="students" element={<StudentList />} />
                        <Route path="classes" element={<ClassList />} />
                        <Route path="classes/:id" element={<ClassDetail />} />
                    </Route>

                    {/* Super Admin Routes */}
                    <Route path="/super-admin" element={<MainLayout menuItems={superAdminMenuItems} />}>
                        <Route index element={<SuperAdminDashboard />} />
                        <Route path="academies" element={<SuperAdminAcademies />} />
                        <Route path="users" element={<SuperAdminUsers />} />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
