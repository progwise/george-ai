import { Role } from '@george-ai/app-commons'
import { FileInfo } from '@george-ai/app-domain'
import { ExtractionMetadata, FileManifest, StorageUsage, WorkspaceManifest } from '@george-ai/file-management'
import { EmbeddingInfo } from '@george-ai/vector-store'

export interface GeorgeTypes {
  EmbeddingInfo: EmbeddingInfo
  WorkspaceManifest: WorkspaceManifest
  WorkspaceSettings: WorkspaceManifest['settings']
  Role: Role
  StorageUsage: StorageUsage
  FileInfo: FileInfo
  FileManifest: FileManifest
  FileExtraction: FileManifest['extractions'][number]
  ExtractionMetadata: ExtractionMetadata
}
