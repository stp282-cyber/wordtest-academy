import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Load notifications
    useEffect(() => {
        if (user?.id) {
            loadNotifications();
        }
    }, [user]);

    // Listen for notification updates
    useEffect(() => {
        const handleUpdate = () => {
            if (user?.id) {
                loadNotifications();
            }
        };

        window.addEventListener('notificationsUpdated', handleUpdate);
        window.addEventListener('notificationAdded', handleUpdate);

        return () => {
            window.removeEventListener('notificationsUpdated', handleUpdate);
            window.removeEventListener('notificationAdded', handleUpdate);
        };
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const loadNotifications = () => {
        const notifs = getNotifications(user.id);
        setNotifications(notifs);
        setUnreadCount(getUnreadCount(user.id));
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        markAsRead(user.id, notification.id);
        loadNotifications();

        // Navigate if link exists
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead(user.id);
        loadNotifications();
    };

    const getNotificationColor = (type) => {
        const colors = {
            assignment: 'text-red-600',
            test_result: 'text-blue-600',
            deadline: 'text-yellow-600',
            announcement: 'text-green-600',
            achievement: 'text-purple-600'
        };
        return colors[type] || 'text-gray-600';
    };

    const getNotificationIcon = (type) => {
        const icons = {
            assignment: '📝',
            test_result: '📊',
            deadline: '⏰',
            announcement: '📢',
            achievement: '🎉'
        };
        return icons[type] || '📌';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors border-2 border-black shadow-neo-sm hover:shadow-neo"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-yellow-300 border-b-4 border-black p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                <h3 className="font-black text-lg">알림함</h3>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-bold hover:underline"
                                >
                                    모두 읽음
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-bold">
                                알림이 없습니다
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b-2 border-black cursor-pointer transition-colors ${!notification.read
                                            ? 'bg-yellow-50 hover:bg-yellow-100'
                                            : 'bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={`text-2xl ${!notification.read ? 'opacity-100' : 'opacity-50'}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-red-500' : 'bg-transparent'}`} />
                                                <h4 className={`font-bold text-sm ${getNotificationColor(notification.type)}`}>
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-slate-700 font-medium mb-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 font-bold">
                                                {formatTime(notification.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t-4 border-black bg-slate-100 p-3 text-center">
                            <button
                                onClick={() => {
                                    navigate('/student/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-sm font-black hover:underline"
                            >
                                알림 설정 하러가기 →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
