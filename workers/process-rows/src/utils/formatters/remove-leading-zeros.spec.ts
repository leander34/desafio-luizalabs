import { removeLeadingZeros } from './remove-leading-zeros'

describe('removeLeadingZeros', () => {
  it('should remove leading zeros from a string', () => {
    expect(removeLeadingZeros('0000000123')).toBe('123')
    expect(removeLeadingZeros('0000000001')).toBe('1')
  })

  it('should return "0" if the string only contains zeros', () => {
    expect(removeLeadingZeros('0000000000')).toBe('0')
    expect(removeLeadingZeros('0')).toBe('0')
  })

  it('should return the same value if no leading zeros are present', () => {
    expect(removeLeadingZeros('123456789')).toBe('123456789')
    expect(removeLeadingZeros('10000000')).toBe('10000000')
  })
})
