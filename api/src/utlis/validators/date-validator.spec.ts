import { dateValidator } from './date-validator'

describe('Date validator', () => {
  it('should be return true', () => {
    expect(dateValidator('2025-10-10')).toBeTruthy()
    expect(dateValidator('2025-01-31')).toBeTruthy()
  })

  it('should be return false', () => {
    expect(dateValidator('2025-100-10')).toBeFalsy()
    expect(dateValidator('2025-10-124')).toBeFalsy()
    expect(dateValidator('20258-10-12')).toBeFalsy()
  })
})
