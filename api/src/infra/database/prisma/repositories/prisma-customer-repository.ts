import type {
  CustomerRepository,
  FindManyWithOrdersAndProductsParams,
} from '@/application/repositories/customers-repository'
import type { PaginationParams } from '@/core/pagination'
import type { Customer } from '@/domain/entities/customer'
import type { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaCustomerMapper } from '../mappers/prisma-customer-mapper'
import { PrismaCustomerWithProductsMapper } from '../mappers/prisma-customer-with-products-mapper'
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma = prismaClient) {}

  async findById(id: number): Promise<Customer | null> {
    const prismaCustomer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    })
    if (!prismaCustomer) {
      return null
    }
    return PrismaCustomerMapper.toDomain(prismaCustomer)
  }

  async create(customer: Customer): Promise<void> {
    const customerConvertedToPrisma = PrismaCustomerMapper.toPrisma(customer)
    console.log(customerConvertedToPrisma)
    await this.prisma.customer.create({
      data: customerConvertedToPrisma,
    })
  }

  async findManyWithOrdersAndProducts(
    params: FindManyWithOrdersAndProductsParams,
    pagination: PaginationParams,
  ): Promise<CustomerWithOrdersAndProducts[]> {
    const page = pagination.page ? Number(pagination.page) : null
    const size = pagination.size ? Number(pagination.size) : 500

    const customers = await prismaClient.customer.findMany({
      take: size,
      skip: page ? ((page ?? 1) - 1) * size : undefined,
      where: params.orderId
        ? {
            orders: {
              some: {
                id: Number(params.orderId),
              },
            },
          }
        : {},
      select: {
        id: true,
        name: true,
        orders: {
          where: {
            date: {
              gte: params.startDate ?? undefined,
              lte: params.endDate ?? undefined,
            },
          },
          select: {
            id: true,
            date: true,
            orderProducts: {
              select: {
                productId: true,
                quantity: true,
                value: true,
              },
            },
          },
        },
      },
    })

    const customerWithCombinedDate = customers.map((customer) => {
      return {
        id: customer.id,
        name: customer.name,
        orders: customer.orders.map((order) => ({
          id: order.id,
          date: order.date,
          total: order.orderProducts.reduce(
            (acc, item) =>
              Number((acc + item.value.toNumber() * item.quantity).toFixed(2)),
            0,
          ),
          products: order.orderProducts.map((orderProduct) => ({
            productId: orderProduct.productId,
            value: orderProduct.value.toNumber(),
            quantity: orderProduct.quantity,
          })),
        })),
      }
    })

    return customerWithCombinedDate.map(
      PrismaCustomerWithProductsMapper.toDomain,
    )
  }
}
