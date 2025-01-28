import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import type { OrderFile } from '@/domain/entities/order-file'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaOrderFileMapper } from '../mappers/prisma-order-file-mapper'

export class PrismaOrderFileRepository implements OrderFileRepository {
  constructor(private prisma = prismaClient) {}
  async create(orderFile: OrderFile): Promise<OrderFile> {
    const orderFileConvertedToPrisma = PrismaOrderFileMapper.toPrisma(orderFile)
    const prismaOrderFileCreated = await prismaClient.orderFile.create({
      data: orderFileConvertedToPrisma,
    })

    return PrismaOrderFileMapper.toDomain(prismaOrderFileCreated)
  }

  async findById(id: number): Promise<OrderFile | null> {
    const prismaOrderFile = await prismaClient.orderFile.findUnique({
      where: {
        id,
      },
    })

    if (!prismaOrderFile) return null

    return PrismaOrderFileMapper.toDomain(prismaOrderFile)
  }

  async changeStatus(orderFile: OrderFile): Promise<void> {
    await prismaClient.orderFile.update({
      where: {
        id: orderFile.id.toValue(),
      },
      data: {
        status: orderFile.status,
        error: orderFile.error,
      },
    })
  }
}
