import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { OrderFile } from './order-file'

describe('OrderFile', () => {
  it('should create an order file with default createdAt and updatedAt', () => {
    const orderFile = OrderFile.create({
      name: 'file1',
      bucket: 'bucket1',
      key: 'key1',
      status: 'PROCESSING',
      url: 'http://example.com/file1',
    })

    expect(orderFile.name).toBe('file1')
    expect(orderFile.createdAt).toBeInstanceOf(Date)
    expect(orderFile.updatedAt).toBeInstanceOf(Date)
    expect(orderFile.deletedAt).toBeUndefined()
    expect(orderFile.error).toBeNull()
  })

  it('should create an order file with provided createdAt and updatedAt', () => {
    const createdAt = new Date(2021, 1, 1)
    const updatedAt = new Date(2022, 1, 1)

    const orderFile = OrderFile.create(
      {
        name: 'file2',
        bucket: 'bucket2',
        key: 'key2',
        status: 'PROCESSED',
        url: 'http://example.com/file2',
        createdAt,
        updatedAt,
      },
      undefined,
    )

    expect(orderFile.createdAt).toBe(createdAt)
    expect(orderFile.updatedAt).toBe(updatedAt)
  })

  it('should create an order file with a provided UniqueEntityId', () => {
    const uniqueId = new UniqueEntityId(123)
    const orderFile = OrderFile.create(
      {
        name: 'file3',
        bucket: 'bucket3',
        key: 'key3',
        status: 'PROCESSING_ERROR',
        url: 'http://example.com/file3',
      },
      uniqueId,
    )

    expect(orderFile.id.toValue()).toBe(123)
  })

  it('should update the status of the order file', () => {
    const orderFile = OrderFile.create({
      name: 'file4',
      bucket: 'bucket4',
      key: 'key4',
      status: 'PROCESSING',
      url: 'http://example.com/file4',
    })

    orderFile.status = 'PROCESSED'
    expect(orderFile.status).toBe('PROCESSED')
  })

  it('should update the error of the order file', () => {
    const orderFile = OrderFile.create({
      name: 'file5',
      bucket: 'bucket5',
      key: 'key5',
      status: 'PROCESSING_ERROR',
      url: 'http://example.com/file5',
    })

    orderFile.error = 'Some error occurred'
    expect(orderFile.error).toBe('Some error occurred')
  })

  it('should set deletedAt to undefined if not provided', () => {
    const orderFile = OrderFile.create({
      name: 'file6',
      bucket: 'bucket6',
      key: 'key6',
      status: 'PROCESSING',
      url: 'http://example.com/file6',
    })

    expect(orderFile.deletedAt).toBeUndefined()
  })

  it('should create an order file with deletedAt when provided', () => {
    const deletedAt = new Date(2023, 1, 1)
    const orderFile = OrderFile.create(
      {
        name: 'file7',
        bucket: 'bucket7',
        key: 'key7',
        status: 'PROCESSING',
        url: 'http://example.com/file7',
        deletedAt,
      },
      undefined,
    )

    expect(orderFile.deletedAt).toBe(deletedAt)
  })
})
