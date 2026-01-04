import { access, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import z from 'zod'

import {
  FileManifest,
  FileManifestSchema,
  LibraryManifest,
  LibraryManifestSchema,
  WorkspaceManifest,
  WorkspaceManifestSchema,
} from '../../schemas'
import { ExtractionMetadata, ExtractionMetadataSchema } from '../../schemas/extraction-metadata'
import { isNodeError } from './commons'

const getExtractionMetadata = async (extractionPath: string): Promise<ExtractionMetadata> => {
  const metadataPath = path.join(extractionPath, 'metadata.json')
  return await getMetadata(metadataPath, ExtractionMetadataSchema)
}

const saveExtractionMetadata = async (extractionPath: string, metadata: ExtractionMetadata): Promise<void> => {
  const metadataPath = path.join(extractionPath, 'metadata.json')
  await saveMetadata(metadataPath, metadata)
}

const getFileManifest = async (filePath: string): Promise<FileManifest> => {
  const manifestPath = path.join(filePath, 'manifest.json')
  return await getMetadata(manifestPath, FileManifestSchema)
}

const saveFileManifest = async (filePath: string, manifest: FileManifest): Promise<void> => {
  const manifestPath = path.join(filePath, 'manifest.json')
  await saveMetadata(manifestPath, manifest)
}

const getLibraryManifest = async (libraryPath: string): Promise<LibraryManifest> => {
  const manifestPath = path.join(libraryPath, 'manifest.json')
  return await getMetadata(manifestPath, LibraryManifestSchema)
}

const saveLibraryManifest = async (libraryPath: string, manifest: LibraryManifest): Promise<void> => {
  const manifestPath = path.join(libraryPath, 'manifest.json')
  await saveMetadata(manifestPath, manifest)
}

const getWorkspaceManifest = async (workspacePath: string): Promise<WorkspaceManifest> => {
  const manifestPath = path.join(workspacePath, 'manifest.json')
  return await getMetadata(manifestPath, WorkspaceManifestSchema)
}

const saveWorkspaceManifest = async (workspacePath: string, manifest: WorkspaceManifest): Promise<void> => {
  const manifestPath = path.join(workspacePath, 'manifest.json')
  await saveMetadata(manifestPath, manifest)
}

const getMetadata = async <T extends z.ZodSchema>(metadataPath: string, schema: T): Promise<z.infer<T>> => {
  try {
    // access() is the promise-based alternative to existsSync
    await access(metadataPath)

    const raw = await readFile(metadataPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return schema.parse(parsed)
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      console.error(`Metadata file not found at ${metadataPath}`)
      throw error
    }
    if (error instanceof z.ZodError) {
      console.error(`Extraction metadata at ${metadataPath} is invalid:`, error.errors)
      throw error
    }
    throw error
  }
}

const saveMetadata = async (
  metadataPath: string,
  metadata: ExtractionMetadata | FileManifest | LibraryManifest | WorkspaceManifest,
): Promise<void> => {
  const tempPath = `${metadataPath}.tmp`
  try {
    const serialized = JSON.stringify(metadata, null, 2)
    await writeFile(tempPath, serialized, 'utf-8')
    await rename(tempPath, metadataPath)
  } catch (err: unknown) {
    // Attempt cleanup of temp file if it exists
    try {
      await unlink(tempPath)
    } catch {
      /* ignore cleanup error */
    }

    const msg = err instanceof Error ? err.message : 'Unknown write error'
    throw new Error(`Failed to save manifest: ${msg}`)
  }
}

export {
  getExtractionMetadata,
  saveExtractionMetadata,
  getFileManifest,
  saveFileManifest,
  getLibraryManifest,
  saveLibraryManifest,
  getWorkspaceManifest,
  saveWorkspaceManifest,
}
