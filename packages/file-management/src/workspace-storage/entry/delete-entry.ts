import { logger } from '../commons'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { entryExists } from './entry-exists'
import { getEntryPath } from './get-entry-path'

import { rm } from 'fs/promises'

export async function deleteEntry(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<void> {
  const entryFolderPath = getEntryPath(identifier)
  const exists = await entryExists(identifier)
  if (!exists) {
    logger.warn('Entry with id does not exist, skipping deletion.', { identifier, entryFolderPath })
    return
  }
  await rm(entryFolderPath, { recursive: true, force: true })
}

export async function deleteEntryOrThrow(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  errorMessage?: string,
): Promise<void> {
  const entryFolderPath = getEntryPath(identifier)
  const exists = await entryExists(identifier)
  if (!exists) {
    logger.error('Entry with id does not exist, throwing an error.', { identifier, entryFolderPath })
    throw new Error(errorMessage || `Entry for ${identifier.type} does not exist.`)
  }
  await rm(entryFolderPath, { recursive: true, force: true })
}
