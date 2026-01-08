import { Readable } from 'stream'

import { FileManifest, LibraryManifest, StorageStats, WorkspaceManifest } from '../schemas'
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
  contentHash?: string
}

export interface IStorageService {
  // --- Workspace ---
  createWorkspace(workspaceId: string, name: string): Promise<WorkspaceManifest>
  getWorkspaceManifest(workspaceId: string): Promise<WorkspaceManifest>

  // --- Library ---
  createLibrary(workspaceId: string, libraryId: string, name: string): Promise<LibraryManifest>
  updateLibrary(workspaceId: string, libraryId: string, updates: Partial<LibraryManifest>): Promise<void>
  // Moves the physical folder and re-bubbles sizes
  moveLibrary(libraryId: string, fromWorkspaceId: string, toWorkspaceId: string): Promise<void>

  // --- File (The Source) ---
  /**
   * Streams the source to storage.
   * Implementation must calculate SHA-256 on the fly during the stream.
   */
  writeSource(
    workspaceId: string,
    libraryId: string,
    fileId: string,
    stream: Readable,
    meta: FileInput,
  ): Promise<FileManifest>
  readSource(workspaceId: string, libraryId: string, fileId: string): Promise<Readable>

  // --- Extractions ---
  /**
   * For sharded data, the stream should be a serialized format
   * or called multiple times for different parts.
   */
  writeExtraction(
    workspaceId: string,
    libraryId: string,
    fileId: string,
    methodId: string,
    stream: Readable,
    config: Record<string, string | number | boolean>,
  ): Promise<ExtractionMetadata>

  /**
   * Returns the extraction stream.
   * If sharded, implementation handles concatenating or providing a manifest of shards.
   */
  readExtraction(workspaceId: string, libraryId: string, fileId: string, methodId: string): Promise<Readable>

  // --- Deletion ---
  deleteFile(workspaceId: string, libraryId: string, fileId: string): Promise<void>

  // --- Integrity ---
  reconcile(workspaceId: string, libraryId?: string, fileId?: string): Promise<StorageStats>
}
