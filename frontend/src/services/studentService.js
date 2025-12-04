/**
 * Student Service
 * 
 * 배포 시 API 연동을 위한 서비스 레이어
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const USE_API = true; // Force API usage for now since we are connected to backend

/**
 * 모든 학생 목록 조회
 */
export const getStudents = async () => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        return await response.json();
    } else {
        const data = localStorage.getItem('students');
        return JSON.parse(data || '[]');
    }
};

/**
 * 학생 상세 조회
 */
export const getStudent = async (id) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch student');
        }

        return await response.json();
    } else {
        const students = await getStudents();
        // Try to match by ID (number) or studentId (string) or UUID
        const student = students.find(s =>
            String(s.id) === String(id) || s.studentId === id || s.username === id
        );

        if (!student) {
            throw new Error('Student not found');
        }
        return student;
    }
};

/**
 * 학생 생성
 */
export const createStudent = async (studentData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/students`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            throw new Error('Failed to create student');
        }

        return await response.json();
    } else {
        const students = await getStudents();
        const newStudent = {
            id: Date.now(),
            ...studentData
        };
        students.push(newStudent);
        localStorage.setItem('students', JSON.stringify(students));

        // 커스텀 이벤트 발생 (같은 탭 내 동기화)
        window.dispatchEvent(new Event('localStorageUpdated'));

        return newStudent;
    }
};

/**
 * 학생 수정
 */
export const updateStudent = async (id, studentData) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            throw new Error('Failed to update student');
        }

        return await response.json();
    } else {
        const students = await getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...studentData };
            localStorage.setItem('students', JSON.stringify(students));
            window.dispatchEvent(new Event('localStorageUpdated'));
            return students[index];
        }
        throw new Error('Student not found');
    }
};

/**
 * 학생 삭제
 */
export const deleteStudent = async (id) => {
    if (USE_API) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete student');
        }

        return true;
    } else {
        const students = await getStudents();
        const filtered = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(filtered));
        window.dispatchEvent(new Event('localStorageUpdated'));
        return true;
    }
};
