import { ExtractionMethod, WorkspaceRole } from '@george-ai/app-commons'
import {
  EmbedFileRequest,
  EnrichItemRequest,
  ExtractFileRequest,
  WorkspaceProcessStatistics,
} from '@george-ai/event-service-client'
import {
  ExtractionMetadata,
  FileManifest,
  LibraryManifest,
  StorageUsage,
  WorkspaceManifest,
} from '@george-ai/file-management'
import { EmbeddingStatistic, FileChunk } from '@george-ai/vector-store'

export interface GeorgeObjectTypes {
  EmbeddingStatistic: EmbeddingStatistic
  EmbedFileRequest: EmbedFileRequest
  EnrichItemRequest: EnrichItemRequest
  ExtractFileRequest: ExtractFileRequest
  ExtractionMetadata: ExtractionMetadata
  ExtractionMethod: ExtractionMethod
  FileChunk: FileChunk
  FileExtraction: FileManifest['extractions'][number]
  FileManifest: FileManifest
  LibraryManifest: LibraryManifest
  LibrarySettings: LibraryManifest['settings']
  ProcessingRequestSettings: Record<string, string | number | boolean> | null
  StorageUsage: StorageUsage
  WorkspaceManifest: WorkspaceManifest
  WorkspaceRole: WorkspaceRole
  WorkspaceSettings: WorkspaceManifest['settings']
  WorkspaceProcessStatistics: WorkspaceProcessStatistics
}
