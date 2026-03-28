import { ExtractionMethod } from '@george-ai/app-schema'

import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import {
  ANALYSIS_FOLDER_NAME,
  ATTACHMENTS_FOLDER_NAME,
  DOCUMENTS_FOLDER_NAME,
  EXTRACTIONS_FOLDER_NAME,
  FRAGMENTS_FOLDER_NAME,
  LIBRARIES_FOLDER_NAME,
} from './constants'

export function getUri(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  options?: {
    attachmentFileName?: string
    analysisFileName?: string
  },
): string {
  const { attachmentFileName, analysisFileName } = options || {}
  const attachmentsSuffix = attachmentFileName ? `/${ATTACHMENTS_FOLDER_NAME}/${attachmentFileName}` : ''
  const analysisSuffix = analysisFileName ? `/${ANALYSIS_FOLDER_NAME}/${analysisFileName}` : ''

  switch (identifier.type) {
    case 'workspace': {
      const { workspaceId } = identifier
      return `georgeai://workspaces/${workspaceId}${attachmentsSuffix}${analysisSuffix}`
    }
    case 'library': {
      const { workspaceId, libraryId } = identifier
      return `georgeai://workspaces/${workspaceId}/${LIBRARIES_FOLDER_NAME}/${libraryId}${attachmentsSuffix}${analysisSuffix}`
    }
    case 'document': {
      const { workspaceId, libraryId, documentId } = identifier
      return `georgeai://workspaces/${workspaceId}/${LIBRARIES_FOLDER_NAME}/${libraryId}/${DOCUMENTS_FOLDER_NAME}/${documentId}${attachmentsSuffix}${analysisSuffix}`
    }
    case 'extraction': {
      const { workspaceId, libraryId, documentId, extractionMethod } = identifier
      return `georgeai://workspaces/${workspaceId}/${LIBRARIES_FOLDER_NAME}/${libraryId}/${DOCUMENTS_FOLDER_NAME}/${documentId}/${EXTRACTIONS_FOLDER_NAME}/${extractionMethod}${attachmentsSuffix}${analysisSuffix}`
    }
    default:
      throw new Error(`Unknown identifier type: ${identifier}`)
  }
}

export function parseUri(uri: string): {
  workspaceId: string
  libraryId?: string
  documentId?: string
  extractionMethod?: ExtractionMethod
  attachmentFileName?: string
  analysisFileName?: string
  fragment?: number
} {
  const regex = new RegExp(
    `^georgeai://workspaces/([^/]+)` +
      `(?:/${LIBRARIES_FOLDER_NAME}/([^/]+))?` +
      `(?:/${DOCUMENTS_FOLDER_NAME}/([^/]+))?` +
      `(?:/${EXTRACTIONS_FOLDER_NAME}/([^/]+))?` +
      `(?:/${FRAGMENTS_FOLDER_NAME}/(\\d+))?` +
      `(?:/${ATTACHMENTS_FOLDER_NAME}/(.+))?` +
      `(?:/${ANALYSIS_FOLDER_NAME}/(.+))?$`,
  )
  const match = uri.match(regex)
  if (!match) {
    throw new Error(`Invalid URI format: ${uri}`)
  }
  const [, workspaceId, libraryId, documentId, extractionMethod, fragmentStr, attachmentFileName, analysisFileName] =
    match
  const fragment = fragmentStr ? parseInt(fragmentStr, 10) : undefined
  return {
    workspaceId,
    libraryId,
    documentId,
    extractionMethod: extractionMethod as ExtractionMethod,
    attachmentFileName,
    analysisFileName,
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
    return `georgeai://legacy//${LIBRARIES_FOLDER_NAME}/${libraryId}`
  }
  if (!extractionMethod) {
    return `georgeai://legacy//${LIBRARIES_FOLDER_NAME}/${libraryId}/files/${fileId}`
  }
  if (!fragment) {
    return `georgeai://legacy//${LIBRARIES_FOLDER_NAME}/${libraryId}/files/${fileId}/${EXTRACTIONS_FOLDER_NAME}/${extractionMethod}`
  }
  return `georgeai://legacy//${LIBRARIES_FOLDER_NAME}/${libraryId}/files/${fileId}/${EXTRACTIONS_FOLDER_NAME}/${extractionMethod}/${FRAGMENTS_FOLDER_NAME}/${fragment}`
}
