import { rename, unlink, writeFile } from 'node:fs/promises'

import { fs } from '../commons'
import { logger } from '../commons'
import { getEntryPath } from '../entry'
import {
  DocumentManifest,
  DocumentManifestSchema,
  ExtractionManifest,
  ExtractionManifestSchema,
  LibraryManifest,
  LibraryManifestSchema,
  WorkspaceManifest,
  WorkspaceManifestSchema,
} from '../schema'
import { getEntryIdentifier } from './get-entry-identifier'

export async function saveEntry(manifest: WorkspaceManifest): Promise<WorkspaceManifest>
export async function saveEntry(manifest: LibraryManifest): Promise<LibraryManifest>
export async function saveEntry(manifest: DocumentManifest): Promise<DocumentManifest>
export async function saveEntry(manifest: ExtractionManifest): Promise<ExtractionManifest>
export async function saveEntry(
  manifest: WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest>
export async function saveEntry(
  manifest: WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest> {
  const entryIdentifier = getEntryIdentifier(manifest)

  const schema =
    manifest.type === 'workspace'
      ? WorkspaceManifestSchema
      : manifest.type === 'library'
        ? LibraryManifestSchema
        : manifest.type === 'document'
          ? DocumentManifestSchema
          : ExtractionManifestSchema

  manifest.storageStats.physicalFileCount = manifest.storageStats.physicalFileCount || 1 // Ensure physicalFileCount is at least 1 to account for the manifest file itself
  manifest.storageStats.physicalBytes =
    manifest.storageStats.physicalBytes || Buffer.from(JSON.stringify(manifest)).length // Default to 0 if not set
  const parseResult = schema.safeParse(manifest) // Validate manifest against schema
  if (!parseResult.success) {
    logger.error(`Failed to save manifest due to validation errors`, {
      manifest,
      errors: parseResult.error.errors,
    })
    throw new Error(
      `Error saving manifest: Validation failed - ${parseResult.error.errors.map((e) => e.message).join(', ')}`,
    )
  }

  const entryPath = getEntryPath(entryIdentifier)
  const manifestPath = fs.getFilePath(entryPath, 'manifest.json')
  const tempPath = fs.getFilePath(entryPath, 'manifest.json.tmp')

  try {
    const serialized = JSON.stringify(manifest, null, 2)
    await writeFile(tempPath, serialized, 'utf-8')
    await rename(tempPath, manifestPath)
    return manifest
  } catch (error) {
    logger.error(`Failed to save manifest`, { manifest, tempPath, manifestPath, error })
    try {
      await unlink(tempPath)
    } catch {
      /* ignore cleanup error */
    }

    const msg = error instanceof Error ? error.message : 'Unknown write error'
    throw new Error(`Failed to save manifest: ${msg}`)
  }
}
