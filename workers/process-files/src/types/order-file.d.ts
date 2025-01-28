export type OrderFileStatus = 'PROCESSING' | 'PROCESSED' | 'PROCESSING_ERROR'

export type OrderFile = {
  order_file_id: number
  bucket: string
  key: string
  name: string
  status: OrderFileStatus
  url: string
  error: string | null | undefined
}
