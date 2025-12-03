/**
 * Progress Service
 * 
 * 학습 진도 및 Class Log 관리를 위한 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || null;
const USE_API = !!API_BASE_URL;

/**
 * 학생의 특정 커리큘럼에 대한 진도 및 Class Log 데이터 조회
 */
export const getClassLogData = async (studentId, curriculumId, weeks = 4) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/progress/class-log/${studentId}/${curriculumId}?weeks=${weeks}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch class log data');
        }

        return await response.json();
    } else {
        // LocalStorage fallback (mock logic for dev)
        const curriculums = JSON.parse(localStorage.getItem(`curriculums_${studentId}`) || '[]');
        const curriculum = curriculums.find(c => c.id === curriculumId);

        if (!curriculum) throw new Error('Curriculum not found');

        const progressKey = `progress_${studentId}_${curriculumId}`;
        const progress = JSON.parse(localStorage.getItem(progressKey) || JSON.stringify({
            currentDay: 0,
            completedDays: 0,
            lastStudyDate: null,
            progressData: {}
        }));

        return {
            curriculum,
            progress,
            weeks
        };
    }
};

/**
 * 학생 진도 업데이트
 */
export const updateProgress = async (studentId, progressData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/progress/student/${studentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
        });

        if (!response.ok) {
            throw new Error('Failed to update progress');
        }

        return await response.json();
    } else {
        const { curriculumId } = progressData;
        const progressKey = `progress_${studentId}_${curriculumId}`;

        // Merge with existing
        const existing = JSON.parse(localStorage.getItem(progressKey) || '{}');
        const updated = { ...existing, ...progressData, lastStudyDate: new Date().toISOString() };

        localStorage.setItem(progressKey, JSON.stringify(updated));
        return { message: 'Progress updated successfully' };
    }
};

/**
 * 전체 학생 진도 현황 조회 (관리자용)
 */
export const getAllStudentsProgress = async () => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/progress/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch students progress');
        }

        return await response.json();
    } else {
        // Mock data for dev
        return [];
    }
};
