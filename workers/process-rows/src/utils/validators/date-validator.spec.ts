import { dateValidator } from './date-validator'

describe('validateDateFormat', () => {
  it('should return true for a valid date in the "yyyymmdd" format', () => {
    expect(dateValidator('20230101')).toBe(true) // Data válida
    expect(dateValidator('19991231')).toBe(true) // Data válida
  })

  it('should return false for an invalid date format (incorrect length or non-numeric)', () => {
    expect(dateValidator('2023-01-01')).toBe(false)
    expect(dateValidator('2023011')).toBe(false)
    expect(dateValidator('202301011')).toBe(false)
    expect(dateValidator('2023abcd')).toBe(false)
    expect(dateValidator('abcd1234')).toBe(false)
  })
})
