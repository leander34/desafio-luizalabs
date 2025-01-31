import type { Order } from '@/domain/entities/order'
import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-products'
export interface FindManyWithProductsParams {
  startDate: string | null
  endDate: string | null
  customerId: number | null
  name: string | null
  orderId: number | null
}
export interface FindUniqueByExternalIdAndFileIdParams {
  externalOrderIdFromFile: number
  orderFileId: number
  externalCustomerIdFromFile: number
}
export interface OrderRepository {
  findById(id: number): Promise<Order | null>
  findUniqueByExternalIdAndFileId(
    params: FindUniqueByExternalIdAndFileIdParams,
  ): Promise<Order | null>
  // findManyWithProducts(
  //   params: FindManyWithProductsParams,
  //   pagination: PaginationParams,
  // ): Promise<OrderWithProducts[]>
  findUniqueWithProducts(id: number): Promise<OrderWithProducts | null>
  create(order: Order): Promise<void>
}
