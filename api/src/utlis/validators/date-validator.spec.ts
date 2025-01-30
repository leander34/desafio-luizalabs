import { dateValidator } from './date-validator'

describe('dateValidator', () => {
  it('should return true for a valid date in the "yyyy-mm-dd" format', () => {
    expect(dateValidator('2025-10-10')).toBeTruthy()
    expect(dateValidator('2025-01-31')).toBeTruthy()
    expect(dateValidator('1999-12-31')).toBeTruthy()
  })

  it('should return false for an invalid date format', () => {
    expect(dateValidator('2025-100-10')).toBeFalsy()
    expect(dateValidator('2025-10-124')).toBeFalsy()
    expect(dateValidator('20258-10-12')).toBeFalsy()
    expect(dateValidator('2023/01/01')).toBe(false)
    expect(dateValidator('2023-01-1')).toBe(false)
    expect(dateValidator('2023-1-01')).toBe(false)
    expect(dateValidator('2023-01-010')).toBe(false)
    expect(dateValidator('abcd-ef-gh')).toBe(false)
  })
})
