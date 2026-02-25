import { getConfigValue } from '@george-ai/app-commons'

import { fs } from '../commons'
import {
  ATTACHMENTS_BACKUP_FOLDER_NAME,
  DOCUMENTS_BACKUP_FOLDER_NAME,
  EXTRACTIONS_BACKUP_FOLDER_NAME,
  LIBRARIES_BACKUP_FOLDER_NAME,
} from '../commons'
import { getEntryPath } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export const getBackupsPath = (
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): string => {
  switch (identifier.type) {
    case 'workspace':
      return getWorkspaceBackupsPath()
    case 'library':
      return getLibraryBackupsPath(identifier)
    case 'document':
      return getDocumentBackupsPath(identifier)
    case 'extraction':
      return getExtractionBackupsPath(identifier)
  }
}

export const getWorkspaceBackupsPath = (): string => {
  return fs.getFolderPath(getConfigValue('STORAGE_PATH_WORKSPACES_BACKUP'))
}

export const getLibraryBackupsPath = (args: { workspaceId: string }): string => {
  const workspaceDir = getEntryPath({ ...args, type: 'workspace', version: 1 })
  return fs.getFolderPath(workspaceDir, LIBRARIES_BACKUP_FOLDER_NAME)
}

export const getDocumentBackupsPath = (args: { workspaceId: string; libraryId: string }): string => {
  const libraryDir = getEntryPath({ ...args, type: 'library', version: 1 })
  return fs.getFolderPath(libraryDir, DOCUMENTS_BACKUP_FOLDER_NAME)
}

export const getExtractionBackupsPath = (args: {
  workspaceId: string
  libraryId: string
  documentId: string
}): string => {
  const documentDir = getEntryPath({ ...args, type: 'document', version: 1 })
  return fs.getFolderPath(documentDir, EXTRACTIONS_BACKUP_FOLDER_NAME)
}

export const getAttachmentsBackupsPath = (
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): string => {
  const entryPath = getEntryPath(identifier)
  return fs.getFolderPath(entryPath, ATTACHMENTS_BACKUP_FOLDER_NAME)
}
