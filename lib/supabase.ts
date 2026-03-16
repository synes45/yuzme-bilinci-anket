const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type SurveyResponse = {
  id: string
  answers: Record<string, string | number>
  started_at: string
  submitted_at: string
  duration_ms: number
}

export async function saveResponseToDB(response: SurveyResponse): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/survey_responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(response),
  })
}

export async function getAllResponsesFromDB(): Promise<SurveyResponse[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/survey_responses?select=*&order=submitted_at.asc`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
  if (!res.ok) return []
  return res.json()
}

export async function clearAllFromDB(): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/survey_responses?id=neq.null`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
}