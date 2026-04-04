export const STORAGE_KEY = 'questionnaire-responses'
const KEY = STORAGE_KEY

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function listResponses() {
  return readRaw().sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  )
}

export function addResponse(payload) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  const entry = {
    id,
    submittedAt: new Date().toISOString(),
    ...payload,
  }
  const next = [entry, ...readRaw()]
  writeRaw(next)
  return entry
}

export function removeResponse(id) {
  const next = readRaw().filter((r) => r.id !== id)
  writeRaw(next)
}

export function clearAllResponses() {
  writeRaw([])
}
