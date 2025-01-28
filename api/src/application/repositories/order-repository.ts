import type { PaginationParams } from '@/core/pagination'
import type { Order } from '@/domain/entities/order'
import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-product'
export interface FindManyWithProductsParams {
  startDate: string | null
  endDate: string | null
  customerId: number | null
  name: string | null
  orderId: number | null
}
export interface OrderRepository {
  findById(id: number): Promise<Order | null>
  findManyWithProducts(
    params: FindManyWithProductsParams,
    pagination: PaginationParams,
  ): Promise<OrderWithProducts[]>
  findUniqueWithProducts(id: number): Promise<OrderWithProducts | null>
  create(order: Order): Promise<void>
}
