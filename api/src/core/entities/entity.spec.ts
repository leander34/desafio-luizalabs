import { Entity } from './entity'
import { UniqueEntityId } from './unique-entity-id'

class ConcreteEntity extends Entity<{ name: string }> {
  constructor(name: string, id?: UniqueEntityId) {
    super({ name }, id)
  }
}

class ConcreteEntity2 extends Entity<{ name: string }> {
  constructor(name: string, id?: UniqueEntityId) {
    super({ name }, id)
  }
}

describe('Entity', () => {
  it('should generate a unique ID if none is provided', () => {
    const entity = new ConcreteEntity('Entity 1')
    expect(entity.id.toValue()).toBe(-1)
    expect(entity.id.toDBValue()).toBe(undefined)
  })

  it('should use the provided ID if one is given', () => {
    const customId = new UniqueEntityId(123)
    const entity = new ConcreteEntity('Entity 2', customId)
    expect(entity.id.toValue()).toBe(123)
    expect(entity.id.toDBValue()).toBe(123)
  })

  it('should return true if entities have the same ID', () => {
    const id = new UniqueEntityId(1)
    const entity1 = new ConcreteEntity('Entity 1', id)
    const entity2 = new ConcreteEntity('Entity 2', id)
    expect(entity1.equals(entity2)).toBe(true)
  })

  it('should return true if the entities have equal IDs but are different entity instances', () => {
    const id1 = new UniqueEntityId(1)
    const entity1 = new ConcreteEntity('Entity 1', id1)
    const entity2 = new ConcreteEntity2('Entity 2', id1)
    expect(entity1.equals(entity2)).toBe(true)
  })

  it('should return true if compared to itself', () => {
    const id = new UniqueEntityId(1)
    const entity = new ConcreteEntity('Entity 1', id)
    expect(entity.equals(entity)).toBe(true)
  })
})
