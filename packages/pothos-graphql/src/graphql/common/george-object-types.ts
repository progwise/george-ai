import { AutomationPreviewValue } from '@george-ai/app-domain'
import { EventQueue, ExtractionMethod, WorkspaceRole } from '@george-ai/app-schema'
import {
  ConnectorActionConfig,
  ConnectorActionConfigValue,
  ConnectorActionFieldMapping,
} from '@george-ai/connector-types'
import {
  DocumentExtractionRequest,
  DocumentVectorizationRequest,
  EventQueueRequest,
  FieldEnrichmentRequest,
  InferenceHostConfig,
  InferenceHostState,
  InferenceModelState,
  WorkerSlotEntry,
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
  ConnectorActionConfigValue: ConnectorActionConfigValue
  ConnectorActionFieldMapping: ConnectorActionFieldMapping
  DocumentExtractionRequest: DocumentExtractionRequest
  DocumentVectorizationRequest: DocumentVectorizationRequest
  DocumentManifest: DocumentManifest
  EmbeddingStatistic: EmbeddingStatistic
  EventQueue: EventQueue
  EventQueueRequest: EventQueueRequest
  ExtractionManifest: ExtractionManifest
  ExtractionMethod: ExtractionMethod
  FieldEnrichmentRequest: FieldEnrichmentRequest
  FileChunk: FileChunk
  FileExtraction: DocumentManifest['extractions'][number]
  InferenceHostState: InferenceHostState
  InferenceHostConfig: InferenceHostConfig
  InferenceModelState: InferenceModelState
  LibraryManifest: LibraryManifest
  LibrarySettings: LibraryManifest['settings']
  ProcessingRequestSettings: Record<string, string | number | boolean> | null
  StorageStats: StorageStats
  WorkerSlotEntry: WorkerSlotEntry
  WorkspaceManifest: WorkspaceManifest
  WorkspaceRole: WorkspaceRole
  WorkspaceSettings: WorkspaceManifest['settings']
}
