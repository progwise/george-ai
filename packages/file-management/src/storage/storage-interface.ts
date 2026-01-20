import { Readable } from 'stream'

import { FileManifest, LibraryManifest, StorageUsage, WorkspaceManifest } from '../schemas'
import { ExtractionMetadata } from '../schemas/extraction-metadata'

/**
 * Metadata provided when creating/updating
 */
export interface FileInput {
  originalName: string
  originalUpdatedAt: string
  mimeType: string
  // Optional: allows the worker to pass a pre-calculated hash
  // to avoid double-processing
  contentHash?: string | null
}

export interface IStorageService {
  exists(
    workspaceId: string,
    args: {
      libraryId?: string
      fileId?: string
      extractionMethod?: string
    },
  ): Promise<boolean>
  // --- Workspace ---
  createWorkspace(workspaceId: string, args: { name: string }): Promise<WorkspaceManifest>
  getWorkspace(workspaceId: string): Promise<WorkspaceManifest | null>

  // --- Library ---
  getLibrary(workspaceId: string, args: { libraryId: string }): Promise<LibraryManifest | null>
  createLibrary(workspaceId: string, args: { libraryId: string; name: string }): Promise<LibraryManifest>
  updateLibrary(workspaceId: string, args: { libraryId: string; updates: Partial<LibraryManifest> }): Promise<void>
  // Moves the physical folder and re-bubbles sizes
  moveLibrary(args: { libraryId: string; fromWorkspaceId: string; toWorkspaceId: string }): Promise<void>

  // --- File (The Source) ---
  getFile(workspaceId: string, args: { libraryId: string; fileId: string }): Promise<FileManifest | null>
  /**
   * Streams the source to storage.
   * Implementation must calculate SHA-256 on the fly during the stream.
   */
  writeSource(
    workspaceId: string,
    args: {
      libraryId: string
      fileId: string
      stream: Readable
      meta: FileInput
    },
  ): Promise<FileManifest>
  readSource(workspaceId: string, args: { libraryId: string; fileId: string }): Promise<Readable>

  // --- Extractions ---
  /**
   * For sharded data, the stream should be a serialized format
   * or called multiple times for different parts.
   */
  writeExtraction(
    workspaceId: string,
    args: {
      libraryId: string
      fileId: string
      methodId: string
      stream: Readable
      config: Record<string, string | number | boolean>
    },
  ): Promise<ExtractionMetadata>

  /**
   * Returns the extraction stream.
   * If sharded, implementation handles concatenating or providing a manifest of shards.
   */
  readExtraction(
    workspaceId: string,
    args: { libraryId: string; fileId: string; methodId?: string; fragment?: number },
  ): Promise<Readable>

  getExtraction(
    workspaceId: string,
    args: { libraryId: string; fileId: string; methodId: string },
  ): Promise<ExtractionMetadata | null>
  // --- Deletion ---
  deleteFiles(workspaceId: string, selector: { libraryId: string; fileId?: string }): Promise<void>

  // --- Integrity ---
  reconcile(workspaceId: string, options: { libraryId?: string; fileId?: string }): Promise<StorageUsage>

  upgradeLegacyFile(
    workspaceId: string,
    args: {
      libraryId: string
      fileId: string
      fileName: string
      mimeType: string
      createdAt: string
      uploadedAt: string
    },
  ): Promise<void>
  upgradeLegacyLibrary(
    workspaceId: string,
    args: {
      libraryId: string
      libraryName: string
      fileInfoLoader: (fileId: string) => Promise<{
        workspaceId: string
        libraryId: string
        fileId: string
        fileName: string
        mimeType: string
        createdAt: string
        uploadedAt: string
      }>
    },
  ): Promise<void>
}
