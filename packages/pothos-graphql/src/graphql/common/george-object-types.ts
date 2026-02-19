import { ExtractionMethod, WorkspaceRole } from '@george-ai/app-commons'
import { AutomationPreviewValue } from '@george-ai/app-domain'
import { ActionConfigValue, ActionFieldMapping, ConnectorActionConfig } from '@george-ai/connector-types'
import {
  EmbedDocumentRequest,
  EnrichItemRequest,
  ExtractDocumentRequest,
  WorkspaceProcessStatistics,
} from '@george-ai/event-service-client'
import {
  Attachment,
  DocumentManifest,
  ExtractionManifest,
  LibraryManifest,
  StorageStats,
  WorkspaceManifest,
} from '@george-ai/file-management'
import { EmbeddingStatistic, FileChunk } from '@george-ai/vector-store'

export type GeorgeObjectTypes = {
  Attachment: Attachment
  AutomationPreviewValue: AutomationPreviewValue
  ConnectorActionConfig: ConnectorActionConfig
  ConnectorActionConfigValue: ActionConfigValue
  ConnectorActionFieldMapping: ActionFieldMapping
  DocumentManifest: DocumentManifest
  EmbeddingStatistic: EmbeddingStatistic
  EmbedDocumentRequest: EmbedDocumentRequest
  EnrichItemRequest: EnrichItemRequest
  ExtractDocumentRequest: ExtractDocumentRequest
  ExtractionManifest: ExtractionManifest
  ExtractionMethod: ExtractionMethod
  FileChunk: FileChunk
  FileExtraction: DocumentManifest['extractions'][number]
  LibraryManifest: LibraryManifest
  LibrarySettings: LibraryManifest['settings']
  ProcessingRequestSettings: Record<string, string | number | boolean> | null
  StorageStats: StorageStats
  WorkspaceManifest: WorkspaceManifest
  WorkspaceRole: WorkspaceRole
  WorkspaceSettings: WorkspaceManifest['settings']
  WorkspaceProcessStatistics: WorkspaceProcessStatistics
}
