import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { Customer } from './customer'

describe('Customer', () => {
  it('should create a customer with default dates if not provided', () => {
    const customer = Customer.create({ name: 'Leander' })

    expect(customer.name).toBe('Leander')
    expect(customer.createdAt).toBeInstanceOf(Date)
    expect(customer.updatedAt).toBeInstanceOf(Date)
    expect(customer.deletedAt).toBeUndefined()
  })

  it('should create a customer with provided dates', () => {
    const createdAt = new Date(2021, 1, 1)
    const updatedAt = new Date(2022, 1, 1)

    const customer = Customer.create(
      { name: 'Leander', createdAt, updatedAt },
      undefined,
    )

    expect(customer.name).toBe('Leander')
    expect(customer.createdAt).toBe(createdAt)
    expect(customer.updatedAt).toBe(updatedAt)
  })

  it('should create a customer with a provided UniqueEntityId', () => {
    const uniqueId = new UniqueEntityId(123)
    const customer = Customer.create({ name: 'Leander' }, uniqueId)

    expect(customer.id.toValue()).toBe(123)
  })

  it('should set deletedAt to undefined if not provided', () => {
    const customer = Customer.create({ name: 'Leander' })

    expect(customer.deletedAt).toBeUndefined()
  })

  it('should create a customer with deletedAt when provided', () => {
    const deletedAt = new Date(2023, 1, 1)
    const customer = Customer.create({ name: 'Leander', deletedAt }, undefined)

    expect(customer.deletedAt).toBe(deletedAt)
  })
})
