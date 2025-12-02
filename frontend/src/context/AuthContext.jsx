import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token/user on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Login attempt:', { username, password: '***' });

            // First, check if this is a student account in localStorage
            const savedStudents = localStorage.getItem('students');
            console.log('Saved students:', savedStudents ? 'Found' : 'Not found');
            if (savedStudents) {
                const students = JSON.parse(savedStudents);
                console.log('Total students:', students.length);
                console.log('Looking for username:', username);
                console.log('Student IDs:', students.map(s => s.studentId));

                const student = students.find(s =>
                    (s.studentId === username || s.id === username) && s.password === password
                );

                console.log('Student found:', student ? 'Yes' : 'No');

                if (student) {
                    // Student found in localStorage
                    const user = {
                        id: student.id,
                        username: student.studentId || student.id,
                        role: 'STUDENT',
                        full_name: student.name,
                        email: student.email,
                        className: student.className
                    };

                    // Create a mock token for localStorage-based auth
                    const token = 'localStorage_student_' + student.id;

                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    setUser(user);
                    return user;
                }
            }

            // If not a student, try backend authentication
            const response = await client.post('/auth/login', { username, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (updates) => {
        const newUser = { ...user, ...updates };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
