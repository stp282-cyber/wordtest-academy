/**
 * Notification Service
 * 
 * 알림 데이터 관리를 위한 서비스
 */

const STORAGE_KEY_PREFIX = 'notifications_';

/**
 * 모든 알림 조회
 */
export const getNotifications = (userId) => {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

/**
 * 읽지 않은 알림 개수
 */
export const getUnreadCount = (userId) => {
    const notifications = getNotifications(userId);
    return notifications.filter(n => !n.read).length;
};

/**
 * 특정 알림 읽음 처리
 */
export const markAsRead = (userId, notificationId) => {
    const notifications = getNotifications(userId);
    const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(userId, updated);
    return updated;
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = (userId) => {
    const notifications = getNotifications(userId);
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(userId, updated);
    return updated;
};

/**
 * 새 알림 추가
 */
export const addNotification = (userId, notification) => {
    const notifications = getNotifications(userId);
    const newNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
    };
    const updated = [newNotification, ...notifications];
    saveNotifications(userId, updated);

    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('notificationAdded', { detail: newNotification }));

    return newNotification;
};

/**
 * 알림 삭제
 */
export const deleteNotification = (userId, notificationId) => {
    const notifications = getNotifications(userId);
    const updated = notifications.filter(n => n.id !== notificationId);
    saveNotifications(userId, updated);
    return updated;
};

/**
 * 모든 알림 삭제
 */
export const clearAllNotifications = (userId) => {
    saveNotifications(userId, []);
    return [];
};

/**
 * 알림 저장 (내부 함수)
 */
const saveNotifications = (userId, notifications) => {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(notifications));

    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('notificationsUpdated'));
};

/**
 * 알림 타입별 설정
 */
export const NOTIFICATION_TYPES = {
    ASSIGNMENT: {
        type: 'assignment',
        color: 'red',
        icon: '📝',
        label: '새로운 과제'
    },
    TEST_RESULT: {
        type: 'test_result',
        color: 'blue',
        icon: '📊',
        label: '시험 결과'
    },
    DEADLINE: {
        type: 'deadline',
        color: 'yellow',
        icon: '⏰',
        label: '마감 임박'
    },
    ANNOUNCEMENT: {
        type: 'announcement',
        color: 'green',
        icon: '📢',
        label: '공지사항'
    },
    ACHIEVEMENT: {
        type: 'achievement',
        color: 'purple',
        icon: '🎉',
        label: '성취'
    }
};

/**
 * 알림 타입 정보 가져오기
 */
export const getNotificationType = (type) => {
    return Object.values(NOTIFICATION_TYPES).find(t => t.type === type) || NOTIFICATION_TYPES.ANNOUNCEMENT;
};
