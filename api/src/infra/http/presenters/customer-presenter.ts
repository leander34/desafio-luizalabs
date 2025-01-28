import type { Customer } from '@/domain/entities/customer'

export class CustomerPresenter {
  static toHttp(customer: Customer) {
    return {
      user_id: customer.id.toValue(),
      name: customer.name,
    }
  }
}
