import { createLogger } from '@george-ai/app-commons'
import { DocumentManifest } from '@george-ai/file-management'

export const logger = createLogger('file-converter')

export interface FileConverterParameters {
  document: DocumentManifest
  timeoutSignal: AbortSignal
}
