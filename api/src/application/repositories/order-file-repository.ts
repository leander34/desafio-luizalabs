import type { OrderFile } from '@/domain/entities/order-file'

export interface OrderFileRepository {
  findById(id: number): Promise<OrderFile | null>
  create(orderFile: OrderFile): Promise<OrderFile>
  changeStatus(orderFile: OrderFile): Promise<OrderFile>
}
