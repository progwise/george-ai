import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('file-converter')

export interface FileConverterParameters {
  workspaceId: string
  libraryId: string
  documentId: string
  mimeType: string
  timeoutSignal: AbortSignal
}
