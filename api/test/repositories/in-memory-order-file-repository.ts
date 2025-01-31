import { generateRandomId } from 'test/utils/generate-random-id'

import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderFile } from '@/domain/entities/order-file'

export class InMemoryOrderFileRepository implements OrderFileRepository {
  public items: OrderFile[] = []

  async changeStatus(orderFile: OrderFile): Promise<void> {
    const orderF = this.items.find(
      (item) => item.id.toValue() === orderFile.id.toValue(),
    )
    if (!orderF) return
    orderF.status = orderFile.status
    orderF.error = orderFile.error
  }

  async findById(id: number): Promise<OrderFile | null> {
    const orderFile = this.items.find(
      (orderFile) => orderFile.id.toValue() === id,
    )
    if (!orderFile) {
      return null
    }

    return orderFile
  }

  async create(orderFile: OrderFile): Promise<OrderFile> {
    const {
      bucket,
      createdAt,
      deletedAt,
      error,
      key,
      name,
      status,
      id,
      updatedAt,
      url,
    } = orderFile
    const newOrderFile = OrderFile.create(
      {
        bucket,
        createdAt,
        deletedAt,
        error,
        key,
        name,
        status,
        updatedAt,
        url,
      },
      id.toDBValue() === -1 ? new UniqueEntityId(generateRandomId()) : id,
    )
    this.items.push(newOrderFile)
    return newOrderFile
  }
}
