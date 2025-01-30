import type { Prisma } from '@prisma/client'

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
  constructor() {}

  async findById(id: number): Promise<Customer | null> {
    const prismaCustomer = await prismaClient.customer.findUnique({
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
    await prismaClient.customer.create({
      data: customerConvertedToPrisma,
    })
  }

  async findManyWithOrdersAndProducts(
    params: FindManyWithOrdersAndProductsParams,
    pagination: PaginationParams,
  ): Promise<CustomerWithOrdersAndProducts[]> {
    const page = pagination.page ? Number(pagination.page) : null
    const size = pagination.size ? Number(pagination.size) : 500

    const where: Prisma.CustomerWhereInput = {}

    if (params.orderId) {
      where.orders = {
        some: {
          id: Number(params.orderId),
        },
      }
    }

    if ((params.startDate || params.endDate) && !params.orderId) {
      where.orders = {
        some: {
          date: {
            gte: params.startDate ? params.startDate : undefined,
            lte: params.endDate ? params.endDate : undefined,
          },
        },
      }
    }

    const customers = await prismaClient.customer.findMany({
      take: size,
      skip: page ? ((page ?? 1) - 1) * size : undefined,
      where,
      select: {
        id: true,
        name: true,
        orders: {
          where: params.orderId
            ? { id: Number(params.orderId) }
            : params.startDate || params.endDate
              ? {
                  date: {
                    gte: params.startDate ? params.startDate : undefined,
                    lte: params.endDate ? params.endDate : undefined,
                  },
                }
              : undefined,
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
