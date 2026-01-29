import { createLogger } from '../../../web-utils/src'

export const logger = createLogger('file-converter-common')

export interface FileConverterParameters {
  workspaceId: string
  libraryId: string
  fileId: string
  mimeType: string
  timeoutSignal: AbortSignal
}
