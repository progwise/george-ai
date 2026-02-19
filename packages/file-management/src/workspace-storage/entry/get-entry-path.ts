import { fs } from '../commons'
import {
  ATTACHMENTS_FOLDER_NAME,
  DOCUMENTS_FOLDER_NAME,
  EXTRACTIONS_FOLDER_NAME,
  FRAGMENTS_FOLDER_NAME,
  LIBRARIES_FOLDER_NAME,
  WORKSPACES_FOLDER_NAME,
  logger,
} from '../commons'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export const getEntryPath = (
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): string => {
  switch (identifier.type) {
    case 'workspace':
      return getWorkspacePath(identifier)
    case 'library':
      return getLibraryPath(identifier)
    case 'document':
      return getDocumentPath(identifier)
    case 'extraction':
      return getExtractionPath(identifier)
  }
}

export const getEntryPathOrThrow = async (
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  errorMessage?: string,
): Promise<string> => {
  const effectivePath = getEntryPath(identifier)

  const exists = await fs.existsFolder(effectivePath)
  if (!exists) {
    if (!errorMessage) {
      errorMessage = `Path does not exist: ${effectivePath}`
    }
    logger.error(errorMessage, { effectivePath })
    throw new Error(`${errorMessage}: ${effectivePath}`)
  }

  return effectivePath
}

export const getAttachmentsPath = (
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): string => {
  const parentDir = getEntryPath(identifier)
  return fs.getFolderPath(parentDir, ATTACHMENTS_FOLDER_NAME)
}

export const getAttachmentsPathOrThrow = async (
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  errorMessage?: string,
): Promise<string> => {
  const attachmentsPath = getAttachmentsPath(identifier)

  const exists = await fs.existsFolder(attachmentsPath)
  if (!exists) {
    if (!errorMessage) {
      errorMessage = `Attachments path does not exist: ${attachmentsPath}`
    }
    logger.error(errorMessage, { attachmentsPath })
    throw new Error(`${errorMessage}: ${attachmentsPath}`)
  }

  return attachmentsPath
}

export const getWorkspacePath = (identifier: { workspaceId: string }): string => {
  return fs.getFolderPath(fs.getRootPath(), WORKSPACES_FOLDER_NAME, identifier.workspaceId)
}

export const getLibrariesPath = (identifier: { workspaceId: string }): string => {
  const workspacePath = getWorkspacePath(identifier)
  return fs.getFolderPath(workspacePath, LIBRARIES_FOLDER_NAME)
}

export const getLibraryPath = (identifier: { libraryId: string; workspaceId: string }): string => {
  const librariesPath = getLibrariesPath(identifier)
  return fs.getFolderPath(librariesPath, identifier.libraryId)
}

export const getDocumentsPath = (identifier: { libraryId: string; workspaceId: string }): string => {
  const libraryPath = getLibraryPath(identifier)
  return fs.getFolderPath(libraryPath, DOCUMENTS_FOLDER_NAME)
}

export const getDocumentPath = (identifier: { documentId: string; libraryId: string; workspaceId: string }): string => {
  const documentsPath = getDocumentsPath(identifier)
  return fs.getFolderPath(documentsPath, identifier.documentId)
}

export const getExtractionsPath = (identifier: {
  documentId: string
  libraryId: string
  workspaceId: string
}): string => {
  const documentPath = getDocumentPath(identifier)
  return fs.getFolderPath(documentPath, EXTRACTIONS_FOLDER_NAME)
}

export const getExtractionPath = (identifier: {
  extractionMethod: string
  documentId: string
  libraryId: string
  workspaceId: string
}): string => {
  const extractionPath = getExtractionsPath(identifier)
  return fs.getFolderPath(extractionPath, identifier.extractionMethod)
}

export const getFragmentsPath = (identifier: {
  extractionMethod: string
  documentId: string
  libraryId: string
  workspaceId: string
}): string => {
  const extractionPath = getExtractionPath(identifier)
  return fs.getFolderPath(extractionPath, FRAGMENTS_FOLDER_NAME)
}
