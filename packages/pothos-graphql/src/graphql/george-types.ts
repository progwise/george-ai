import { Role } from '@george-ai/app-commons'
import { FileManifest, StorageUsage, WorkspaceManifest } from '@george-ai/file-management'
import { EmbeddingInfo } from '@george-ai/vector-store'

export interface GeorgeTypes {
  EmbeddingInfo: EmbeddingInfo
  WorkspaceManifest: WorkspaceManifest
  WorkspaceSettings: WorkspaceManifest['settings']
  Role: Role
  StorageUsage: StorageUsage
  FileManifest: FileManifest
}
