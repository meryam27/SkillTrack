import { API_URL } from "../config.ts";

// Service for competence-related API calls

export const getCompetences = async () => {
    const response = await fetch(`${API_URL}/admin/competences`);
    return await response.json();
};

export const createCompetence = async (competenceData: any) => {
    const response = await fetch(`${API_URL}/admin/competences/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(competenceData),
    });
    return await response.json();
};

export const updateCompetence = async (id: string, competenceData: any) => {
    const response = await fetch(`${API_URL}/admin/competences/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(competenceData),
    });
    return await response.json();
};
