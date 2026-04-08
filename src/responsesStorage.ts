import type { SatisfactionValue } from './surveyConstants'

export const STORAGE_KEY = 'questionnaire-responses'
const KEY = STORAGE_KEY

export type SurveyResponsePayload = {
  name: string
  email: string
  satisfaction: SatisfactionValue | ''
  comments: string
  improvementNotes?: string
}

export type SurveyResponse = SurveyResponsePayload & {
  id: string
  submittedAt: string
}

function readRaw(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SurveyResponse[]) : []
  } catch {
    return []
  }
}

function writeRaw(list: SurveyResponse[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function listResponses(): SurveyResponse[] {
  return readRaw().sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )
}

export function addResponse(payload: SurveyResponsePayload): SurveyResponse {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  const entry: SurveyResponse = {
    id,
    submittedAt: new Date().toISOString(),
    ...payload,
  }
  const next = [entry, ...readRaw()]
  writeRaw(next)
  return entry
}

export function removeResponse(id: string): void {
  const next = readRaw().filter((r) => r.id !== id)
  writeRaw(next)
}

export function clearAllResponses(): void {
  writeRaw([])
}
