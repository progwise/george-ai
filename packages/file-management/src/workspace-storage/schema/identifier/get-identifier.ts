import { ExtractionMethod } from '@george-ai/app-schema'

import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '..'

export function getIdentifier(parameters: {
  workspaceId: string
  libraryId?: string
  documentId?: string
  extractionMethod?: ExtractionMethod
}): WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier {
  const { workspaceId, libraryId, documentId, extractionMethod } = parameters
  if (!libraryId) {
    return {
      version: 1,
      type: 'workspace',
      workspaceId,
    }
  }
  if (!documentId) {
    return {
      version: 1,
      type: 'library',
      workspaceId,
      libraryId,
    }
  }

  if (!extractionMethod) {
    return {
      version: 1,
      type: 'document',
      workspaceId,
      libraryId,
      documentId,
    }
  }

  return {
    version: 1,
    type: 'extraction',
    workspaceId,
    libraryId,
    documentId,
    extractionMethod,
  }
}
