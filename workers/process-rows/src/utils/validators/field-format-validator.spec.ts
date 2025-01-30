import { InvalidFieldFormatError } from '@/errors/invalid-field-format-error'

import { fieldFormatValidator } from './field-format-validator'

describe('fieldFormatValidator', () => {
  it('should throw an error if the fieldType is "id" and the value is not a number', () => {
    const fieldName = 'id'

    expect(() => fieldFormatValidator('string', fieldName, 'id')).toThrowError(
      new InvalidFieldFormatError(`Invalid field format: ${fieldName}`),
    )
  })

  it('should not throw an error if the fieldType is "id" and the value is a number', () => {
    const fieldName = 'id'

    expect(() => fieldFormatValidator(1, fieldName, 'id')).not.toThrow()
  })

  it('should throw an error if the fieldType is "value" and the value is NaN or less than 0', () => {
    const fieldName = 'value'

    expect(() =>
      fieldFormatValidator('string', fieldName, 'value'),
    ).toThrowError(
      new InvalidFieldFormatError(`Invalid field format: ${fieldName}`),
    )

    expect(() => fieldFormatValidator(-1, fieldName, 'value')).toThrowError(
      new InvalidFieldFormatError(`Invalid field format: ${fieldName}`),
    )
  })

  it('should not throw an error if the fieldType is "value" and the value is a valid positive number', () => {
    const fieldName = 'value'

    expect(() => fieldFormatValidator(100, fieldName, 'value')).not.toThrow()
  })

  it('should throw an error if the fieldType is "date" and the value is not a valid date format', () => {
    const fieldName = 'date'

    expect(() =>
      fieldFormatValidator('202212311', fieldName, 'date'),
    ).toThrowError(
      new InvalidFieldFormatError(`Invalid field format: ${fieldName}`),
    )
  })

  it('should not throw an error if the fieldType is "date" and the value is a valid date format', () => {
    const fieldName = 'date'

    expect(() =>
      fieldFormatValidator('20230101', fieldName, 'date'),
    ).not.toThrow()
  })
})
