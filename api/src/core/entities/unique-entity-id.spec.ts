import { UniqueEntityId } from './unique-entity-id'

describe('UniqueEntityId', () => {
  it('should generate a unique ID with the default value of -1 when no value is provided', () => {
    const uniqueId = new UniqueEntityId()
    expect(uniqueId.toValue()).toBe(-1)
  })

  it('should use the provided value if a value is given', () => {
    const uniqueId = new UniqueEntityId(123)
    expect(uniqueId.toValue()).toBe(123)
  })

  it('should return undefined when calling toDBValue() for the default value of -1', () => {
    const uniqueId = new UniqueEntityId()
    expect(uniqueId.toDBValue()).toBeUndefined()
  })

  it('should return the provided value when calling toDBValue()', () => {
    const uniqueId = new UniqueEntityId(123)
    expect(uniqueId.toDBValue()).toBe(123)
  })

  it('should return true if two UniqueEntityIds are equal', () => {
    const id1 = new UniqueEntityId(1)
    const id2 = new UniqueEntityId(1)
    expect(id1.equals(id2)).toBe(true)
  })

  it('should return false if two UniqueEntityIds are not equal', () => {
    const id1 = new UniqueEntityId(1)
    const id2 = new UniqueEntityId(2)
    expect(id1.equals(id2)).toBe(false)
  })

  it('should return true if the same UniqueEntityId is compared with itself', () => {
    const id = new UniqueEntityId(1)
    expect(id.equals(id)).toBe(true)
  })
})
