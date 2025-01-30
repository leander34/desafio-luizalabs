import { dateFormatter } from './date-formatter'

describe('dateFormatter', () => {
  it('should format a valid date correctly to "YYYY-MM-DD"', () => {
    expect(dateFormatter('2023/01/01')).toBe('2023-01-01')
    expect(dateFormatter('01-01-2023')).toBe('2023-01-01')
  })

  it('should return the same formatted date when the input is already in "YYYY-MM-DD"', () => {
    expect(dateFormatter('2023-02-28')).toBe('2023-02-28')
    expect(dateFormatter('1990-11-10')).toBe('1990-11-10')
  })
})
