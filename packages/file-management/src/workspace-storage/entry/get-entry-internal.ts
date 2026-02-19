import { readFile } from 'node:fs/promises'
import z from 'zod'

import { fs } from '../commons'
import { MANIFEST_FILE_NAME, logger } from '../commons'
import { getEntryPath } from '../entry'
import {
  DocumentIdentifier,
  DocumentManifest,
  DocumentManifestSchema,
  ExtractionIdentifier,
  ExtractionManifest,
  ExtractionManifestSchema,
  LibraryIdentifier,
  LibraryManifest,
  LibraryManifestSchema,
  StorageStatsSchema,
  WorkspaceIdentifier,
  WorkspaceManifest,
  WorkspaceManifestSchema,
} from '../schema'

export async function getEntryInternal(
  id: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest> {
  const entryPath = getEntryPath(id)

  const manifestPath = fs.getFilePath(entryPath, MANIFEST_FILE_NAME)

  try {
    const raw = await readFile(manifestPath, 'utf-8')
    const parsed = JSON.parse(raw)

    logger.debug('Parsed manifest JSON successfully', { id, manifestPath, parsed: JSON.stringify(parsed, null, 2) })

    // Backwards compatibility: if created or updated fields are missing but createdAt or updatedAt fields exist, use them as fallback
    // TODO: Cleanup this backwards compatibility code after a few releases
    if (!parsed.created && !!parsed.createdAt) {
      logger.warn('Manifest is missing created date, adding current date as default value', { id, manifestPath })
      parsed.created = parsed.createdAt
    }

    if (!parsed.updated && parsed.updatedAt && parsed.updatedAt !== parsed.createdAt) {
      logger.warn('Manifest is missing updated date, adding created date as default value', { id, manifestPath })
      parsed.updated = parsed.created
    }

    if (!parsed.storageStats) {
      logger.warn('Manifest is missing storageStats, adding default value', { id, manifestPath })
      parsed.storageStats = StorageStatsSchema.default({}).parse(undefined)
    }
    if (!parsed.attachments) {
      logger.warn('Manifest is missing attachments array, adding default value', { id, manifestPath })
      parsed.attachments = []
    }

    if (id.type === 'document' && !parsed.extractions) {
      logger.warn('Document manifest is missing extractions array, adding default value', { id, manifestPath })
      parsed.extractions = []
    }

    switch (id.type) {
      case 'workspace':
        return WorkspaceManifestSchema.parse({ ...parsed, ...id })
      case 'library':
        return LibraryManifestSchema.parse({ ...parsed, ...id })
      case 'document':
        return DocumentManifestSchema.parse({ ...parsed, ...id })
      case 'extraction':
        return ExtractionManifestSchema.parse({ ...parsed, ...id })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`Metadata is invalid:`, { id, manifestPath, errors: JSON.stringify(error.errors, null, 2) })
      throw error
    }
    throw error
  }
}
