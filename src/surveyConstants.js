export const SATISFACTION_LEVELS = [
  { value: '1', label: '1 とても不満' },
  { value: '2', label: '2 不満' },
  { value: '3', label: '3 ふつう' },
  { value: '4', label: '4 満足' },
  { value: '5', label: '5 とても満足' },
]

export function satisfactionLabel(value) {
  return SATISFACTION_LEVELS.find((l) => l.value === value)?.label ?? value
}
