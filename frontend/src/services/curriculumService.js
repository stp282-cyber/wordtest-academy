/**
 * Curriculum Service
 * 
 * 배포 시 API 연동을 위한 서비스 레이어
 * 현재는 localStorage를 사용하지만, 배포 시 API_BASE_URL만 설정하면 자동으로 API 사용
 */

// 환경 변수 설정 (배포 시 .env 파일에서 관리)
const API_BASE_URL = import.meta.env.VITE_API_URL || null;
const USE_API = !!API_BASE_URL; // API URL이 있으면 API 사용

/**
 * 모든 커리큘럼 목록 조회
 */
export const getCurriculums = async () => {
    if (USE_API) {
        // 배포 환경: API 호출
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculums`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch curriculums');
        }

        return await response.json();
    } else {
        // 개발 환경: localStorage 사용
        const data = localStorage.getItem('curriculums');
        return JSON.parse(data || '[]');
    }
};

/**
 * 특정 커리큘럼 조회
 */
export const getCurriculumById = async (id) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculums/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch curriculum');
        }

        return await response.json();
    } else {
        const curriculums = await getCurriculums();
        return curriculums.find(c => c.id === id);
    }
};

/**
 * 커리큘럼 생성
 */
export const createCurriculum = async (curriculumData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculums`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(curriculumData)
        });

        if (!response.ok) {
            throw new Error('Failed to create curriculum');
        }

        return await response.json();
    } else {
        const curriculums = await getCurriculums();
        const newCurriculum = {
            id: Date.now(),
            ...curriculumData,
            created: new Date().toISOString()
        };
        curriculums.push(newCurriculum);
        localStorage.setItem('curriculums', JSON.stringify(curriculums));
        return newCurriculum;
    }
};

/**
 * 커리큘럼 수정
 */
export const updateCurriculum = async (id, curriculumData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculums/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(curriculumData)
        });

        if (!response.ok) {
            throw new Error('Failed to update curriculum');
        }

        return await response.json();
    } else {
        const curriculums = await getCurriculums();
        const index = curriculums.findIndex(c => c.id === id);
        if (index !== -1) {
            curriculums[index] = { ...curriculums[index], ...curriculumData };
            localStorage.setItem('curriculums', JSON.stringify(curriculums));
            return curriculums[index];
        }
        throw new Error('Curriculum not found');
    }
};

/**
 * 커리큘럼 삭제
 */
export const deleteCurriculum = async (id) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculums/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete curriculum');
        }

        return true;
    } else {
        const curriculums = await getCurriculums();
        const filtered = curriculums.filter(c => c.id !== id);
        localStorage.setItem('curriculums', JSON.stringify(filtered));
        return true;
    }
};

/**
 * 학생별 커리큘럼 조회
 */
export const getStudentCurriculums = async (studentId) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculum/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch student curriculums');
        }

        return await response.json();
    } else {
        const data = localStorage.getItem(`curriculums_${studentId}`);
        return JSON.parse(data || '[]');
    }
};

/**
 * 학생에게 커리큘럼 할당
 */
export const assignCurriculumToStudent = async (studentId, curriculumData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculum/students/${studentId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(curriculumData)
        });

        if (!response.ok) {
            throw new Error('Failed to assign curriculum');
        }

        return await response.json();
    } else {
        const curriculums = await getStudentCurriculums(studentId);
        const newCurriculum = {
            id: Date.now(),
            ...curriculumData,
            createdAt: new Date().toISOString()
        };
        curriculums.push(newCurriculum);
        localStorage.setItem(`curriculums_${studentId}`, JSON.stringify(curriculums));
        return newCurriculum;
    }
};

/**
 * 학생의 커리큘럼 삭제
 */
export const removeStudentCurriculum = async (studentId, curriculumId) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/curriculum/students/${studentId}/${curriculumId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove curriculum');
        }

        return true;
    } else {
        const curriculums = await getStudentCurriculums(studentId);
        const filtered = curriculums.filter(c => c.id !== curriculumId);
        localStorage.setItem(`curriculums_${studentId}`, JSON.stringify(filtered));
        return true;
    }
};
