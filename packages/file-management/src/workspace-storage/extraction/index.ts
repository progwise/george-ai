import { ExtractionMethod } from '@george-ai/app-commons'

import { DocumentIdentifier, ExtractionIdentifier } from '../schema'
import { createExtraction } from './create-extraction'
import { deleteExtraction } from './delete-extraction'
import { getExtraction } from './get-extraction'
import { readExtraction } from './read-extraction'

export { createExtraction, getExtraction, deleteExtraction, readExtraction }

export default {
  create: createExtraction,
  get: getExtraction,
  delete: deleteExtraction,
  read: (
    workspaceId: string,
    params: { libraryId: string; documentId: string; extractionMethod?: ExtractionMethod; fragment?: number },
  ) => {
    const identifier: DocumentIdentifier | ExtractionIdentifier = params.extractionMethod
      ? { ...params, workspaceId, type: 'extraction', extractionMethod: params.extractionMethod, version: 1 }
      : { ...params, workspaceId, type: 'document', version: 1 }

    return readExtraction(identifier, params.fragment)
  },
}

export type { ExtractionWriter } from './extraction.writer'
