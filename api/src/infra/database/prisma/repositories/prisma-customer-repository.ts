import type { Prisma } from '@prisma/client'

import type {
  CustomerRepository,
  FindManyWithOrdersAndProductsParams,
  FindUniqueByExternalIdAndFileIdParams,
} from '@/application/repositories/customers-repository'
import type { PaginationParams } from '@/core/pagination'
import type { Customer } from '@/domain/entities/customer'
import type { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaCustomerMapper } from '../mappers/prisma-customer-mapper'
import { PrismaCustomerWithProductsMapper } from '../mappers/prisma-customer-with-products-mapper'
export class PrismaCustomerRepository implements CustomerRepository {
  constructor() {}
  async findUniqueByExternalIdAndFileId({
    externalCustomerIdFromFile,
    orderFileId,
  }: FindUniqueByExternalIdAndFileIdParams): Promise<Customer | null> {
    const prismaCustomer = await prismaClient.customer.findUnique({
      where: {
        orderFileId_externalCustomerIdFromFile: {
          externalCustomerIdFromFile,
          orderFileId,
        },
      },
    })

    if (!prismaCustomer) {
      return null
    }

    return PrismaCustomerMapper.toDomain(prismaCustomer)
  }

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

    if (params.externalOrderIdFromFile) {
      where.orders = {
        some: {
          externalOrderIdFromFile: Number(params.externalOrderIdFromFile),
        },
      }
    }

    if (
      (params.startDate || params.endDate) &&
      !params.externalOrderIdFromFile
    ) {
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
        externalCustomerIdFromFile: true,
        name: true,
        orders: {
          where: params.externalOrderIdFromFile
            ? {
                externalOrderIdFromFile: Number(params.externalOrderIdFromFile),
              }
            : params.startDate || params.endDate
              ? {
                  date: {
                    gte: params.startDate ? params.startDate : undefined,
                    lte: params.endDate ? params.endDate : undefined,
                  },
                }
              : undefined,
          select: {
            externalOrderIdFromFile: true,
            date: true,
            orderProducts: {
              select: {
                externalProductIdFromFile: true,
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
        externalCustomerIdFromFile: customer.externalCustomerIdFromFile,
        name: customer.name,
        orders: customer.orders.map((order) => ({
          externalOrderIdFromFile: order.externalOrderIdFromFile,
          date: order.date,
          total: order.orderProducts.reduce(
            (acc, item) =>
              Number((acc + item.value.toNumber() * item.quantity).toFixed(2)),
            0,
          ),
          orderProducts: order.orderProducts.map((orderProduct) => ({
            externalProductIdFromFile: orderProduct.externalProductIdFromFile,
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
