export const SATISFACTION_LEVELS = [
  { value: 'very_dissatisfied', label: 'とても不満' },
  { value: 'dissatisfied', label: '不満' },
  { value: 'neutral', label: '普通' },
  { value: 'satisfied', label: '満足' },
  { value: 'very_satisfied', label: 'とても満足' },
]

const LEGACY_NUMERIC = {
  '1': 'very_dissatisfied',
  '2': 'dissatisfied',
  '3': 'neutral',
  '4': 'satisfied',
  '5': 'very_satisfied',
}

/** 保存値（新キーまたは旧1〜5）を正規化。不明なら空文字 */
export function normalizeSatisfactionValue(raw) {
  if (raw == null || raw === '') return ''
  const s = String(raw)
  if (LEGACY_NUMERIC[s]) return LEGACY_NUMERIC[s]
  if (SATISFACTION_LEVELS.some((l) => l.value === s)) return s
  return ''
}

export function satisfactionLabel(value) {
  const key = normalizeSatisfactionValue(value)
  if (!key) return value == null || value === '' ? '' : String(value)
  return SATISFACTION_LEVELS.find((l) => l.value === key)?.label ?? String(value)
}

/** とても不満・不満・普通のとき改善欄を出す */
export function isLowSatisfaction(value) {
  const key = normalizeSatisfactionValue(value)
  return (
    key === 'very_dissatisfied' ||
    key === 'dissatisfied' ||
    key === 'neutral'
  )
}

/** 集計用。順序どおり 1〜5 の数値。不正値は NaN */
export function satisfactionOrdinal(raw) {
  const key = normalizeSatisfactionValue(raw)
  const i = SATISFACTION_LEVELS.findIndex((l) => l.value === key)
  return i >= 0 ? i + 1 : NaN
}
