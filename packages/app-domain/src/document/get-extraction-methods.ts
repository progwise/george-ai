import { EXTRACTION_METHODS } from '@george-ai/app-schema'
import { isMethodAvailableForMimeType } from '@george-ai/file-converter'

export function getExtractionMethods(parameters: { mimeType?: string }) {
  if (!parameters.mimeType) {
    return EXTRACTION_METHODS
  }

  return EXTRACTION_METHODS.filter((method) => {
    return isMethodAvailableForMimeType(method, parameters.mimeType)
  })
}
