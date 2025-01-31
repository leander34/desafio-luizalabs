import { makeOrderFile } from 'test/factories/make-order-file'
import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { ChangeOrderFileStatusUseCase } from './change-order-file-status'

const makeSut = () => {
  const orderFileRepository = new InMemoryOrderFileRepository()
  const sut = new ChangeOrderFileStatusUseCase(orderFileRepository)
  return {
    sut,
    orderFileRepository,
  }
}
describe('Change order file status', () => {
  it('it should not be possible to change the status of a file that does not exist', async () => {
    const { sut, orderFileRepository } = makeSut()
    const orderFileRepositorySpyFindById = vi.spyOn(
      orderFileRepository,
      'findById',
    )
    const result = await sut.execute({
      orderFileId: 1,
      status: 'PROCESSED',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(orderFileRepositorySpyFindById).toHaveBeenCalledWith(1)
  })

  it('it should not be possible to change to the same status', async () => {
    const { sut, orderFileRepository } = makeSut()
    const orderFileRepositorySpy = vi.spyOn(orderFileRepository, 'findById')

    const orderFile = makeOrderFile(
      { status: 'PROCESSING' },
      new UniqueEntityId(1),
    )

    await orderFileRepository.create(orderFile)

    const result = await sut.execute({
      orderFileId: orderFile.id.toValue(),
      status: 'PROCESSING',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(BadRequestError)
    expect(orderFileRepositorySpy).toHaveBeenCalledWith(1)
  })

  it('deve ser possivel alterar o status', async () => {
    const { sut, orderFileRepository } = makeSut()
    const orderFileRepositorySpy = vi.spyOn(orderFileRepository, 'findById')
    const orderFileRepositorySpyShangeStatus = vi.spyOn(
      orderFileRepository,
      'changeStatus',
    )

    const orderFile = makeOrderFile(
      { status: 'PROCESSING' },
      new UniqueEntityId(1),
    )

    await orderFileRepository.create(orderFile)

    const result = await sut.execute({
      orderFileId: orderFile.id.toValue(),
      status: 'PROCESSED',
    })

    expect(result.isRight()).toBeTruthy()
    expect(orderFileRepositorySpy).toHaveBeenCalledWith(1)
    expect(orderFileRepositorySpyShangeStatus).toHaveBeenCalledTimes(1)
  })
})
