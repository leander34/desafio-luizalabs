import dayjs from 'dayjs'

import { InvalidFieldFormatError } from '@/errors/invalid-field-format-error'

export function fieldFormatValidator<T>(
  value: T,
  fieldName: string,
  fieldType: 'date' | 'id' | 'value',
): T {
  if (fieldType === 'id' && isNaN(value as number)) {
    throw new InvalidFieldFormatError(`Invalid field format: ${fieldName}`)
  }

  if (
    fieldType === 'value' &&
    isNaN(value as number) &&
    (value as number) < 0
  ) {
    throw new InvalidFieldFormatError(`Invalid field format: ${fieldName}`)
  }

  const dateFormat = dayjs(value as string, 'yyyymmdd')

  if (fieldType === 'date' && dateFormat.isValid() === false) {
    throw new InvalidFieldFormatError(`Invalid field format: ${fieldName}`)
  }

  return value
}
