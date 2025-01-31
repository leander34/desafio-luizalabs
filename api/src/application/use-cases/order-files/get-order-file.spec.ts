import { makeOrderFile } from 'test/factories/make-order-file'
import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { GetOrderFileUseCase } from './get-order-file'

const makeSut = () => {
  const orderFileRepository = new InMemoryOrderFileRepository()
  const sut = new GetOrderFileUseCase(orderFileRepository)
  return {
    sut,
    orderFileRepository,
  }
}
describe('Get order file', () => {
  it('should not be possible to get a file that does not exist', async () => {
    const { sut, orderFileRepository } = makeSut()
    const orderFileRepositorySpy = vi.spyOn(orderFileRepository, 'findById')
    const result = await sut.execute({
      orderFileId: 1,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(orderFileRepositorySpy).toHaveBeenCalledTimes(1)
    expect(orderFileRepositorySpy).toHaveBeenCalledWith(1)
  })

  it('should be possible to get a file if it exists', async () => {
    const { sut, orderFileRepository } = makeSut()
    const orderFileRepositorySpy = vi.spyOn(orderFileRepository, 'findById')

    const orderFile = makeOrderFile({}, new UniqueEntityId(1))
    await orderFileRepository.create(orderFile)

    const result = await sut.execute({
      orderFileId: orderFile.id.toValue(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(orderFileRepositorySpy).toHaveBeenCalledTimes(1)
    expect(orderFileRepositorySpy).toHaveBeenCalledWith(1)
  })
})
