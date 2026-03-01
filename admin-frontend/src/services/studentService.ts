import { API_URL } from '../config.ts';

// Service for student-related API calls

export const getStudents = async () => {
    const response = await fetch(`${API_URL}/admin/students`);
    return await response.json();
};

export const createStudent = async (studentData: any) => {
    const response = await fetch(`${API_URL}/admin/students/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
    });
    return await response.json();
};

export const updateStudent = async (id: string, studentData: any) => {
    const response = await fetch(`${API_URL}/admin/students/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
    });
    return await response.json();
};
