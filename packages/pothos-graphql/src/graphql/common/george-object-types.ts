import { ExtractionMethod, WorkspaceRole } from '@george-ai/app-commons'
import { WorkspaceProcessStatistics } from '@george-ai/event-service-client'
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
  ExtractionMetadata: ExtractionMetadata
  ExtractionMethod: ExtractionMethod
  FileChunk: FileChunk
  FileExtraction: FileManifest['extractions'][number]
  FileManifest: FileManifest
  LibraryManifest: LibraryManifest
  LibrarySettings: LibraryManifest['settings']
  StorageUsage: StorageUsage
  WorkspaceManifest: WorkspaceManifest
  WorkspaceRole: WorkspaceRole
  WorkspaceSettings: WorkspaceManifest['settings']
  WorkspaceProcessStatistics: WorkspaceProcessStatistics
}
