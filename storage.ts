import { Answers } from './questions'

const STORAGE_KEY = 'swimming_survey_responses'

export type SurveyResponse = {
  id: string
  answers: Answers
  startedAt: string
  submittedAt: string
  durationMs: number
}

export function saveResponse(answers: Answers, startedAt: string): void {
  const responses = getAllResponses()
  const submittedAt = new Date().toISOString()
  const durationMs = new Date(submittedAt).getTime() - new Date(startedAt).getTime()
  const newResponse: SurveyResponse = {
    id: Date.now().toString(),
    answers,
    startedAt,
    submittedAt,
    durationMs,
  }
  responses.push(newResponse)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses))
}

export function getAllResponses(): SurveyResponse[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

const COMPLETED_KEY = 'swimming_survey_completed'

export function hasCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COMPLETED_KEY) === 'true'
}

export function markCompleted(): void {
  localStorage.setItem(COMPLETED_KEY, 'true')
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(COMPLETED_KEY)
}