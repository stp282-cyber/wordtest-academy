import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from localStorage on mount or user change
    useEffect(() => {
        if (user) {
            loadNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const loadNotifications = () => {
        if (!user) return;

        const storageKey = `notifications_${user.id}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setNotifications(parsed);
                setUnreadCount(parsed.filter(n => !n.read).length);
            } catch (e) {
                console.error('Failed to parse notifications:', e);
                setNotifications([]);
            }
        } else {
            // Add welcome notification if empty
            const welcome = {
                id: Date.now(),
                type: 'info',
                title: '환영합니다!',
                message: '워드테스트 아카데미에 오신 것을 환영합니다.',
                timestamp: new Date().toISOString(),
                read: false
            };
            setNotifications([welcome]);
            setUnreadCount(1);
            localStorage.setItem(storageKey, JSON.stringify([welcome]));
        }
    };

    const addNotification = (type, title, message) => {
        if (!user) return;

        const newNotification = {
            id: Date.now(),
            type, // 'info', 'success', 'warning', 'error'
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false
        };

        const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
        setNotifications(updated);
        setUnreadCount(prev => prev + 1);

        const storageKey = `notifications_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const markAsRead = (id) => {
        if (!user) return;

        const updated = notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );

        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);

        const storageKey = `notifications_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const markAllAsRead = () => {
        if (!user) return;

        const updated = notifications.map(n => ({ ...n, read: true }));

        setNotifications(updated);
        setUnreadCount(0);

        const storageKey = `notifications_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const deleteNotification = (id) => {
        if (!user) return;

        const updated = notifications.filter(n => n.id !== id);

        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);

        const storageKey = `notifications_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
