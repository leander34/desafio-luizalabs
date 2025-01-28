import type { OrderFileStatus } from '@prisma/client'

import type { Optional } from '@/core/optional'

import { Entity } from '../../core/entities/entity'
import type { UniqueEntityId } from '../../core/entities/unique-entity-id'

export interface OrderFileProps {
  name: string
  bucket: string
  key: string
  status: 'PROCESSING' | 'PROCESSED' | 'PROCESSING_ERROR'
  url: string
  error?: string | null
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export class OrderFile extends Entity<OrderFileProps> {
  static create(
    props: Optional<OrderFileProps, 'createdAt' | 'error'>,
    id?: UniqueEntityId,
  ) {
    const file = new OrderFile(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        error: props.error ?? null,
      },
      id,
    )
    return file
  }

  get name() {
    return this.props.name
  }

  get bucket() {
    return this.props.bucket
  }

  get key() {
    return this.props.key
  }

  get status() {
    return this.props.status
  }

  set status(status: OrderFileStatus) {
    this.props.status = status
  }

  get url() {
    return this.props.url
  }

  get error() {
    return this.props.error
  }

  set error(error: string | null | undefined) {
    this.props.error = error
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }
}
