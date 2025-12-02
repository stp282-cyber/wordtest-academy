/**
 * Class Service
 * 
 * 배포 시 API 연동을 위한 서비스 레이어
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || null;
const USE_API = !!API_BASE_URL;

/**
 * 모든 반 목록 조회
 */
export const getClasses = async () => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/classes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch classes');
        }

        return await response.json();
    } else {
        const data = localStorage.getItem('classes');
        return JSON.parse(data || '[]');
    }
};

/**
 * 반 생성
 */
export const createClass = async (classData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/classes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(classData)
        });

        if (!response.ok) {
            throw new Error('Failed to create class');
        }

        return await response.json();
    } else {
        const classes = await getClasses();
        const newClass = {
            id: Date.now(),
            ...classData
        };
        classes.push(newClass);
        localStorage.setItem('classes', JSON.stringify(classes));
        window.dispatchEvent(new Event('localStorageUpdated'));
        return newClass;
    }
};

/**
 * 반 삭제
 */
export const deleteClass = async (id) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete class');
        }

        return true;
    } else {
        const classes = await getClasses();
        const filtered = classes.filter(c => c.id !== id);
        localStorage.setItem('classes', JSON.stringify(filtered));
        window.dispatchEvent(new Event('localStorageUpdated'));
        return true;
    }
};
