export interface ProcessFilesService {
  run(): Promise<void>
  sendToDLDQueue(content: Buffer<ArrayBufferLike>): Promise<void>
  handleProcessMensagemError(content: Buffer<ArrayBufferLike>): Promise<void>
}
