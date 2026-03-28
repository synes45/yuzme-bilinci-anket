import { SurveyResponse, saveResponseToDB, getAllResponsesFromDB, clearAllFromDB } from './appwrite';

export type { SurveyResponse };

const COMPLETED_KEY = 'swimming_survey_completed';

export async function saveResponse(answers: Record<string, string | number>, startedAt: string): Promise<void> {
    const submitted_at = new Date().toISOString();
    const duration_ms = new Date(submitted_at).getTime() - new Date(startedAt).getTime();

    const response: SurveyResponse = {
        answers,
        started_at: startedAt,
        submitted_at,
        duration_ms,
    };

    await saveResponseToDB(response);
    localStorage.setItem(COMPLETED_KEY, 'true');
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
    return getAllResponsesFromDB();
}

export async function clearAllResponses(): Promise<void> {
    await clearAllFromDB();
}

export function hasCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COMPLETED_KEY) === 'true';
}

export const markCompleted = () => localStorage.setItem('swimming_survey_completed', 'true');

export const clearAllData = async () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(COMPLETED_KEY);
    }
};