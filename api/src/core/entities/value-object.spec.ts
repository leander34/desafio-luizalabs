import { ValueObject } from './value-object'

class ConcreteValueObject extends ValueObject<{ name: string; age: number }> {
  constructor(name: string, age: number) {
    super({ name, age })
  }
}

describe('ValueObject', () => {
  it('should return true if the properties are equal', () => {
    const vo1 = new ConcreteValueObject('John', 30)
    const vo2 = new ConcreteValueObject('John', 30)
    expect(vo1.equals(vo2)).toBe(true)
  })

  it('should return false if the properties are not equal', () => {
    const vo1 = new ConcreteValueObject('John', 30)
    const vo2 = new ConcreteValueObject('Jane', 30)
    expect(vo1.equals(vo2)).toBe(false)
  })

  it('should return false if the compared object is null', () => {
    const vo = new ConcreteValueObject('John', 30)
    expect(vo.equals(null as any)).toBe(false)
  })

  it('should return false if the compared object is undefined', () => {
    const vo = new ConcreteValueObject('John', 30)
    expect(vo.equals(undefined as any)).toBe(false)
  })

  it('should return false if the compared object does not have properties', () => {
    const vo1 = new ConcreteValueObject('John', 30)
    const vo2: any = {} // an empty object without properties
    expect(vo1.equals(vo2)).toBe(false)
  })

  it('should return true if comparing the same instance of ValueObject', () => {
    const vo = new ConcreteValueObject('John', 30)
    expect(vo.equals(vo)).toBe(true)
  })
})
