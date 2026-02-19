import { ExtractionMethod } from '@george-ai/app-commons'

import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export function getUri(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  attachmentFileName?: string,
): string {
  const attachmentsSuffix = attachmentFileName ? `/attachments/${attachmentFileName}` : ''

  switch (identifier.type) {
    case 'workspace': {
      const { workspaceId } = identifier
      return `georgeai://workspaces/${workspaceId}${attachmentsSuffix}`
    }
    case 'library': {
      const { workspaceId, libraryId } = identifier
      return `georgeai://workspaces/${workspaceId}/libraries/${libraryId}${attachmentsSuffix}`
    }
    case 'document': {
      const { workspaceId, libraryId, documentId } = identifier
      return `georgeai://workspaces/${workspaceId}/libraries/${libraryId}/documents/${documentId}${attachmentsSuffix}`
    }
    case 'extraction': {
      const { workspaceId, libraryId, documentId, extractionMethod } = identifier
      return `georgeai://workspaces/${workspaceId}/libraries/${libraryId}/documents/${documentId}/extractions/${extractionMethod}${attachmentsSuffix}`
    }
    default:
      throw new Error(`Unknown identifier type: ${identifier}`)
  }
}

export function parseUri(uri: string): {
  workspaceId: string
  libraryId?: string
  fileId?: string
  extractionMethod?: ExtractionMethod
  attachmentFileName?: string
  fragment?: number
} {
  const regex =
    /^georgeai:\/\/workspaces\/([^/]+)(?:\/libraries\/([^/]+))?(?:\/files\/([^/]+))?(?:\/extractions\/([^/]+))?(?:\/fragments\/(\d+))?(?:\/attachments\/(.+))?$/
  const match = uri.match(regex)
  if (!match) {
    throw new Error(`Invalid URI format: ${uri}`)
  }
  const [, workspaceId, libraryId, fileId, extractionMethod, fragmentStr, attachmentFileName] = match
  const fragment = fragmentStr ? parseInt(fragmentStr, 10) : undefined
  return {
    workspaceId,
    libraryId,
    fileId,
    extractionMethod: extractionMethod as ExtractionMethod,
    attachmentFileName,
    fragment,
  }
}

export function getLegacyUri(parameters: {
  libraryId?: string
  fileId?: string
  extractionMethod?: ExtractionMethod
  fragment?: number
}): string {
  const { libraryId, fileId, extractionMethod, fragment } = parameters
  if (!libraryId) {
    return `georgeai://legacy/`
  }
  if (!fileId) {
    return `georgeai://legacy//libraries/${libraryId}`
  }
  if (!extractionMethod) {
    return `georgeai://legacy//libraries/${libraryId}/files/${fileId}`
  }
  if (!fragment) {
    return `georgeai://legacy//libraries/${libraryId}/files/${fileId}/extractions/${extractionMethod}`
  }
  return `georgeai://legacy//libraries/${libraryId}/files/${fileId}/extractions/${extractionMethod}/fragments/${fragment}`
}
