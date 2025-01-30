import { dateFormatter } from './formatters/date-formatter'
import { removeLeadingZeros } from './formatters/remove-leading-zeros'
import { fieldFormatValidator } from './validators/field-format-validator'

export function processLine(line: string) {
  return {
    customerId: fieldFormatValidator(
      parseInt(removeLeadingZeros(line.slice(0, 10))),
      'customerId',
      'id',
    ),
    name: line.slice(10, 55).trim(),
    orderId: fieldFormatValidator(
      parseInt(removeLeadingZeros(line.slice(55, 65))),
      'orderId',
      'id',
    ),
    productId: fieldFormatValidator(
      parseInt(removeLeadingZeros(line.slice(65, 75))),
      'productId',
      'id',
    ),
    value: fieldFormatValidator(
      Number(parseFloat(line.slice(75, 87).trim()).toFixed(2)),
      'value',
      'value',
    ),
    date: dateFormatter(
      fieldFormatValidator(line.slice(87, 95), 'date', 'date'),
    ),
  }
}
