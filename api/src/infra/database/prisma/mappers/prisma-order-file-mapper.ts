import { OrderFile as PrismaOrderFile, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderFile } from '@/domain/entities/order-file'
export class PrismaOrderFileMapper {
  static toDomain(prismaOrderFile: PrismaOrderFile): OrderFile {
    return OrderFile.create(
      {
        bucket: prismaOrderFile.bucket,
        key: prismaOrderFile.key,
        name: prismaOrderFile.name,
        status: prismaOrderFile.status,
        url: prismaOrderFile.url,
        error: prismaOrderFile.error,
        createdAt: prismaOrderFile.createdAt,
        updatedAt: prismaOrderFile.updatedAt,
        deletedAt: prismaOrderFile.deletedAt,
      },
      new UniqueEntityId(prismaOrderFile.id),
    )
  }

  static toPrisma(orderFile: OrderFile): Prisma.OrderFileUncheckedCreateInput {
    return {
      id: orderFile.id.toDBValue(),
      bucket: orderFile.bucket,
      key: orderFile.key,
      name: orderFile.name,
      status: orderFile.status,
      url: orderFile.url,
      error: orderFile.error,
      createdAt: orderFile.createdAt,
      updatedAt: orderFile.updatedAt,
      deletedAt: orderFile.deletedAt,
    }
  }
}
