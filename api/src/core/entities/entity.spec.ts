import type { Optional } from '../optional'
import { Entity } from './entity'
import { UniqueEntityId } from './unique-entity-id'

const makeSut = () => {
  const sut = EntityMock.create({}, new UniqueEntityId(1))
  return {
    sut,
  }
}

interface EntityMockProps {}
class EntityMock extends Entity<EntityMockProps> {
  static create(props: EntityMockProps, id?: UniqueEntityId) {
    const entity = new EntityMock(
      {
        ...props,
      },
      id,
    )
    return entity
  }
}

test('1', () => {
  const entityWithId = EntityMock.create({}, new UniqueEntityId(1))
  const entityWithout = EntityMock.create({}, undefined)
  expect(entityWithId).toHaveProperty('id')
  expect(entityWithId.id).toBeInstanceOf(UniqueEntityId)
  expect(entityWithId.id.toValue()).toEqual(1)
  expect(entityWithId.id.toDBValue()).toEqual(1)
  expect(entityWithId.id.equals(new UniqueEntityId(1))).toBeTruthy()
  expect(entityWithId.id.equals(new UniqueEntityId(2))).toBeFalsy()

  expect(entityWithout.id.toDBValue()).toEqual(undefined)
})
