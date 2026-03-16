import { SurveyResponse, saveResponseToDB, getAllResponsesFromDB, clearAllFromDB } from './supabase'

export type { SurveyResponse }

const COMPLETED_KEY = 'swimming_survey_completed'

export async function saveResponse(answers: Record<string, string | number>, startedAt: string): Promise<void> {
  const submitted_at = new Date().toISOString()
  const duration_ms = new Date(submitted_at).getTime() - new Date(startedAt).getTime()
  const response: SurveyResponse = {
    id: Date.now().toString(),
    answers,
    started_at: startedAt,
    submitted_at,
    duration_ms,
  }
  await saveResponseToDB(response)
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  return getAllResponsesFromDB()
}

export function hasCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COMPLETED_KEY) === 'true'
}

export function markCompleted(): void {
  localStorage.setItem(COMPLETED_KEY, 'true')
}

export async function clearAllData(): Promise<void> {
  await clearAllFromDB()
}