const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Formats a Date using its local calendar fields (never UTC), so the
 * resulting YYYY-MM-DD string always matches what the user sees in their
 * own timezone.
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** True when `value` is a YYYY-MM-DD string that represents a real calendar date. */
export function isValidDateString(value: string): boolean {
  if (!DATE_STRING_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

/**
 * String/lexicographic comparison is correct and timezone-safe for
 * zero-padded YYYY-MM-DD values, so no Date object round-trip is needed.
 */
export function isAfterDateString(a: string, b: string): boolean {
  return a > b
}
