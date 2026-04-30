import { ExtractionMethod } from '@george-ai/app-schema'

import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import {
  ANALYSIS_FOLDER_NAME,
  ATTACHMENTS_FOLDER_NAME,
  DOCUMENTS_FOLDER_NAME,
  EXTRACTIONS_BACKUP_FOLDER_NAME,
  EXTRACTIONS_FOLDER_NAME,
  FRAGMENTS_FOLDER_NAME,
  LIBRARIES_FOLDER_NAME,
} from './constants'

export function getUri(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  fileName: string = 'manifest.json',
  options?: {
    attachment?: boolean
    analysis?: boolean
    /** Backup folder name (e.g. `pdfExtraction_1773510848855`) — routes to extractions_backup/ at the document level */
    extractionBackup?: string
  },
): string {
  const { attachment, analysis, extractionBackup } = options || {}

  const fileSuffix = attachment
    ? `${ATTACHMENTS_FOLDER_NAME}/${fileName}`
    : analysis
      ? `${ANALYSIS_FOLDER_NAME}/${fileName}`
      : fileName

  switch (identifier.type) {
    case 'workspace': {
      const { workspaceId } = identifier
      return `georgeai://workspaces/${workspaceId}/${fileSuffix}`
    }
    case 'library': {
      const { workspaceId, libraryId } = identifier
      return `georgeai://workspaces/${workspaceId}/${LIBRARIES_FOLDER_NAME}/${libraryId}/${fileSuffix}`
    }
    case 'document': {
      const { workspaceId, libraryId, documentId } = identifier
      const base = `georgeai://workspaces/${workspaceId}/${LIBRARIES_FOLDER_NAME}/${libraryId}/${DOCUMENTS_FOLDER_NAME}/${documentId}`
      if (extractionBackup) {
        return `${base}/${EXTRACTIONS_BACKUP_FOLDER_NAME}/${extractionBackup}/${fileSuffix}`
      }
      return `${base}/${fileSuffix}`
    }
    case 'extraction': {
      const { workspaceId, libraryId, documentId, extractionMethod } = identifier
      return `georgeai://workspaces/${workspaceId}/${LIBRARIES_FOLDER_NAME}/${libraryId}/${DOCUMENTS_FOLDER_NAME}/${documentId}/${EXTRACTIONS_FOLDER_NAME}/${extractionMethod}/${fileSuffix}`
    }
    default:
      throw new Error(`Unknown identifier type: ${identifier}`)
  }
}

export function parseUri(uri: string): {
  workspaceId: string
  fileName: string
} & Partial<{
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
  /** Set when the URI points into an extractions_backup/ folder; value is the backup folder name e.g. `pdfExtraction_1773510848855` */
  extractionBackupFolderName: string
  attachment: boolean
  analysis: boolean
  fragment: number
}> {
  const regex = new RegExp(
    `^georgeai://workspaces/([^/]+)` +
      `(?:/${LIBRARIES_FOLDER_NAME}/([^/]+))?` +
      `(?:/${DOCUMENTS_FOLDER_NAME}/([^/]+))?` +
      `(?:/${EXTRACTIONS_FOLDER_NAME}/([^/]+)|/${EXTRACTIONS_BACKUP_FOLDER_NAME}/([^/]+))?` +
      `(?:/${FRAGMENTS_FOLDER_NAME}/(\\d+))?` +
      `(?:/${ATTACHMENTS_FOLDER_NAME}/(.+)|/${ANALYSIS_FOLDER_NAME}/(.+)|/([^/]+))?$`,
  )
  const match = uri.match(regex)
  if (!match) {
    throw new Error(`Invalid URI format: ${uri}`)
  }
  const [
    ,
    workspaceId,
    libraryId,
    documentId,
    extractionMethod,
    extractionBackupFolderName,
    fragmentStr,
    attachmentFileName,
    analysisFileName,
    pureFileName,
  ] = match
  const fragment = fragmentStr ? parseInt(fragmentStr, 10) : undefined
  const fileName = attachmentFileName ?? analysisFileName ?? pureFileName
  return {
    workspaceId,
    ...(libraryId && { libraryId }),
    ...(documentId && { documentId }),
    ...(extractionMethod && { extractionMethod: extractionMethod as ExtractionMethod }),
    ...(extractionBackupFolderName && { extractionBackupFolderName }),
    fileName,
    ...(!!attachmentFileName && { attachment: true }),
    ...(!!analysisFileName && { analysis: true }),
    ...(fragment !== undefined && { fragment }),
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
