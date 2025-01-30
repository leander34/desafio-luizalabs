import type { PaginationParams } from '@/core/pagination'
import type { Customer } from '@/domain/entities/customer'
import type { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'
export interface FindManyWithOrdersAndProductsParams {
  startDate: string | null
  endDate: string | null
  orderId: number | null
}
export interface CustomerRepository {
  create(customer: Customer): Promise<void>
  findById(id: number): Promise<Customer | null>
  findManyWithOrdersAndProducts(
    params: FindManyWithOrdersAndProductsParams,
    pagination: PaginationParams,
  ): Promise<CustomerWithOrdersAndProducts[]>
}
