import { InvalidFieldFormatError } from '@/errors/invalid-field-format-error'

import { dateValidator } from './date-validator'

export function fieldFormatValidator(
  value: any,
  fieldName: string,
  fieldType: 'date' | 'id' | 'value',
) {
  if (fieldType === 'id' && isNaN(value as number)) {
    throw new InvalidFieldFormatError(`Invalid field format: ${fieldName}`)
  }

  if (fieldType === 'value') {
    const numericValue = value as number
    if (isNaN(numericValue) || numericValue < 0) {
      throw new InvalidFieldFormatError(`Invalid field format: ${fieldName}`)
    }
  }

  if (fieldType === 'date' && dateValidator(value as string) === false) {
    throw new InvalidFieldFormatError(`Invalid field format: ${fieldName}`)
  }

  return value
}
