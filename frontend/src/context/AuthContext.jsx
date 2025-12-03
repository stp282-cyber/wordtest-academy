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

        // Validate token for non-ASCII characters (Fix for "String contains non ISO-8859-1 code point" error)
        if (token && /[^\x00-\x7F]/.test(token)) {
            console.warn('Found invalid token in localStorage, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
            return;
        }

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Login attempt:', { username, password: '***' });

            // 1. Try Backend Authentication First
            try {
                const response = await client.post('/auth/login', { username, password });
                const { token, user } = response.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return user;
            } catch (backendError) {
                console.warn('Backend login failed, checking local storage fallback...', backendError);

                // 2. Fallback to LocalStorage (Legacy/Offline Mode)
                const savedStudents = localStorage.getItem('students');
                if (savedStudents) {
                    const students = JSON.parse(savedStudents);
                    const student = students.find(s =>
                        (s.studentId === username || s.id === username) && s.password === password
                    );

                    if (student) {
                        const user = {
                            id: student.id,
                            username: student.studentId || student.id,
                            role: 'STUDENT',
                            full_name: student.name,
                            email: student.email,
                            className: student.className
                        };

                        // Encode token to prevent "non ISO-8859-1" header errors
                        // Using btoa to ensure ASCII characters
                        const token = btoa('localStorage_student_' + encodeURIComponent(student.id));

                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(user));
                        setUser(user);
                        return user;
                    }
                }

                // If both fail, throw the backend error
                throw backendError;
            }
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
