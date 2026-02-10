import { Readable } from 'stream'

import { ExtractionMethod } from '@george-ai/app-commons'

import { FileManifest, LibraryManifest, StorageUsage, WorkspaceManifest } from '../schemas'
import { ExtractionMetadata } from '../schemas/extraction-metadata'

/**
 * Writer interface for streaming extraction with attachments.
 */
export interface ExtractionWriter {
  /** Write markdown content chunks */
  write(chunk: string | Buffer): void

  /** Queue an attachment stream - doesn't block, tracked internally */
  addAttachment(filename: string, stream: Readable, mimeType?: string): void

  /** Finalize extraction - waits for all attachment streams to complete */
  finish(): Promise<ExtractionMetadata>

  /** Abort and cleanup on error */
  abort(error?: Error): Promise<void>
}

/**
 * Metadata provided when creating/updating
 */
export interface FileInput {
  originalName: string
  originalUpdatedAt: string
  originalContentHash: string | null
  mimeType: string
}

export interface IStorageService {
  exists(
    workspaceId: string,
    args: {
      libraryId?: string
      fileId?: string
      extractionMethod?: ExtractionMethod
    },
  ): Promise<boolean>
  // --- Workspace ---
  createWorkspace(workspaceId: string, args: { name: string }): Promise<WorkspaceManifest>
  getWorkspace(workspaceId: string): Promise<WorkspaceManifest | null>
  deleteWorkspace(workspaceId: string): Promise<void>
  migrateWorkspace(
    workspaceId: string,
    args: {
      workspaceName: string
      libraries: {
        id: string
        name: string
      }[]
      fileInfoLoader: (fileId: string) => Promise<{
        workspaceId: string
        libraryId: string
        fileId: string
        fileName: string
        mimeType: string
        createdAt: string
        uploadedAt?: string | null
        hash?: string | null
      }>
    },
  ): Promise<void>

  // --- Library ---
  getLibrary(workspaceId: string, args: { libraryId: string }): Promise<LibraryManifest | null>
  createLibrary(workspaceId: string, args: { libraryId: string; name: string }): Promise<LibraryManifest>
  deleteLibrary(workspaceId: string, args: { libraryId: string }): Promise<void>

  updateLibrary(workspaceId: string, args: { libraryId: string; updates: Partial<LibraryManifest> }): Promise<void>
  // Moves the physical folder and re-bubbles sizes
  moveLibrary(args: { libraryId: string; fromWorkspaceId: string; toWorkspaceId: string }): Promise<void>

  // --- File (The Source) ---
  getFile(workspaceId: string, args: { libraryId: string; fileId: string }): Promise<FileManifest | null>

  writeSource(
    workspaceId: string,
    args: {
      libraryId: string
      fileId: string
      stream: Readable | AsyncIterable<string | Buffer>
      meta: FileInput
    },
  ): Promise<FileManifest>
  readSource(workspaceId: string, args: { libraryId: string; fileId: string }): Promise<Readable>

  createExtraction(
    workspaceId: string,
    args: {
      libraryId: string
      fileId: string
      extractionMethod: ExtractionMethod
      splitFragmentPattern?: string
    },
  ): Promise<ExtractionWriter>

  readExtraction(
    workspaceId: string,
    args: { libraryId: string; fileId: string; extractionMethod?: ExtractionMethod | null; fragment?: number | null },
  ): Promise<AsyncIterable<string>>

  getAttachmentFilePath(
    workspaceId: string,
    args: {
      libraryId: string
      fileId: string
      extractionMethod: ExtractionMethod
      attachmentFileName: string
    },
  ): Promise<string | null>

  readAttachment(
    workspaceId: string,
    args: { libraryId: string; fileId: string; extractionMethod: ExtractionMethod; filename: string },
  ): Promise<Readable>

  getExtraction(
    workspaceId: string,
    args: { libraryId: string; fileId: string; extractionMethod: ExtractionMethod },
  ): Promise<ExtractionMetadata | null>

  deleteFiles(workspaceId: string, selector: { libraryId: string; fileId?: string | null }): Promise<void>

  reconcile(workspaceId: string, options?: { libraryId?: string; fileId?: string }): Promise<StorageUsage>
}
