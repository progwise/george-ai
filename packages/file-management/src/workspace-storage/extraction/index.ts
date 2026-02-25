import { ExtractionMethod } from '@george-ai/app-commons'

import { createExtraction } from './create-extraction'
import { deleteExtraction } from './delete-extraction'
import { ExtractionWriter } from './extraction.writer'
import { getExtraction } from './get-extraction'
import { readExtraction } from './read-extraction'
import { writeExtraction } from './write-extraction'

export { createExtraction, getExtraction, deleteExtraction, readExtraction, writeExtraction }

export default {
  create: createExtraction,
  get: (
    workspaceId: string,
    parameters: { libraryId: string; documentId: string; extractionMethod: ExtractionMethod },
  ) => getExtraction({ ...parameters, workspaceId, type: 'extraction', version: 1 }),
  delete: deleteExtraction,
  read: (
    workspaceId: string,
    parameters: { libraryId: string; documentId: string; extractionMethod: ExtractionMethod; fragment?: number },
  ) => readExtraction({ ...parameters, workspaceId, type: 'extraction', version: 1 }, parameters.fragment),
  write: writeExtraction,
}

export type { ExtractionWriter }
