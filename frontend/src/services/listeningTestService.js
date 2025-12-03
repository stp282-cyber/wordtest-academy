/**
 * Listening Test Service
 * 
 * AI 듣기 평가 생성 및 관리를 위한 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || null;
const USE_API = !!API_BASE_URL;

/**
 * AI 문제 생성 (Gemini)
 */
export const generateTest = async (params) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/listening/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error('Failed to generate test');
        }

        return await response.json();
    } else {
        throw new Error('AI generation requires backend connection');
    }
};

/**
 * TTS 오디오 생성
 */
export const generateAudio = async (text, gender = 'female') => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/listening/audio`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, gender })
        });

        if (!response.ok) {
            throw new Error('Failed to generate audio');
        }

        return await response.json(); // Returns { audioUrl }
    } else {
        throw new Error('Audio generation requires backend connection');
    }
};

/**
 * 테스트 할당
 */
export const assignTest = async (assignmentData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/listening/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assignmentData)
        });

        if (!response.ok) {
            throw new Error('Failed to assign test');
        }

        return await response.json();
    } else {
        // Mock for dev
        const assignments = JSON.parse(localStorage.getItem('test_assignments') || '[]');
        const newAssignment = { id: Date.now(), ...assignmentData, status: 'assigned' };
        assignments.push(newAssignment);
        localStorage.setItem('test_assignments', JSON.stringify(assignments));
        return newAssignment;
    }
};

/**
 * 학생별 할당된 테스트 조회
 */
export const getStudentAssignments = async (studentId) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/listening/assignments/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch assignments');
        }

        return await response.json();
    } else {
        // Mock for dev
        const assignments = JSON.parse(localStorage.getItem('test_assignments') || '[]');
        return assignments.filter(a => a.studentId === studentId);
    }
};
