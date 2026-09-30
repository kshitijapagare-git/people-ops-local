import { describe, expect, it } from 'vitest'
import { isAfterDateString, isValidDateString, toISODateString } from '../lib/date'

describe('isAfterDateString', () => {
  it('returns true when a is after b', () => {
    expect(isAfterDateString('2024-03-02', '2024-03-01')).toBe(true)
  })

  it('returns false when a equals b', () => {
    expect(isAfterDateString('2024-03-01', '2024-03-01')).toBe(false)
  })

  it('returns false when a is before b', () => {
    expect(isAfterDateString('2024-03-01', '2024-03-02')).toBe(false)
  })
})

describe('isValidDateString', () => {
  it('rejects a non-existent calendar date', () => {
    expect(isValidDateString('2024-02-30')).toBe(false)
  })

  it('accepts a real calendar date', () => {
    expect(isValidDateString('2024-02-01')).toBe(true)
  })

  it('rejects a malformed string', () => {
    expect(isValidDateString('2024/02/01')).toBe(false)
  })
})

describe('toISODateString', () => {
  it('formats using local calendar fields', () => {
    const date = new Date(2024, 2, 5)
    expect(toISODateString(date)).toBe('2024-03-05')
  })

  it('zero-pads month and day', () => {
    const date = new Date(2024, 0, 9)
    expect(toISODateString(date)).toBe('2024-01-09')
  })
})
