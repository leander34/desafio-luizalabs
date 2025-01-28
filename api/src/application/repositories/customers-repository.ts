import type { Customer } from '@/domain/entities/customer'

export interface CustomerRepository {
  create(customer: Customer): Promise<void>
  findById(id: number): Promise<Customer | null>
}
