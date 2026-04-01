// lib/storage.ts

export async function saveResponse(
    answers: Record<string, string | number>, 
    startedAt: string,
    age: string,
    gender: string
): Promise<void> {
    try {
        const submitted_at = new Date().toISOString();
        const duration_ms = new Date(submitted_at).getTime() - new Date(startedAt).getTime();

        // LocalStorage işlemleri (Tarayıcıda saklamak istersen)
        const responseData = {
            answers,
            started_at: startedAt,
            submitted_at,
            duration_ms,
            age,
            gender
        };
        
        localStorage.setItem('survey_response', JSON.stringify(responseData));
        
    } catch (error) {
        console.error("Storage error:", error);
        throw error; // Hatayı yukarı fırlat ki sayfa hata olduğunu anlasın
    }
}

// Bunlar zaten sende vardır, dokunmana gerek yok:
export function hasCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('survey_completed') === 'true';
}

export function markCompleted(): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('survey_completed', 'true');
    }
}