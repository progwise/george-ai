import { AutomationPreviewValue } from '@george-ai/app-domain'
import {
  DocumentFile,
  EventQueue,
  ExtractionMethod,
  InferenceHostConnection,
  InferenceModel,
  WorkspaceRole,
} from '@george-ai/app-schema'
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
import { EmbeddingStatistic, VectorStoreChunk } from '@george-ai/vector-store'

import { LegacyFile } from '../library'
import { CurrentUser } from '../user/current-user'

export type GeorgeObjectTypes = {
  Attachment: Attachment
  AutomationPreviewValue: AutomationPreviewValue
  ConnectorActionConfig: ConnectorActionConfig
  ConnectorActionConfigValue: ConnectorActionConfigValue
  ConnectorActionFieldMapping: ConnectorActionFieldMapping
  CurrentUser: CurrentUser
  DocumentExtractionRequest: DocumentExtractionRequest
  DocumentFile: DocumentFile
  DocumentManifest: DocumentManifest
  DocumentVectorizationRequest: DocumentVectorizationRequest
  EmbeddingStatistic: EmbeddingStatistic
  EventQueue: EventQueue
  EventQueueRequest: EventQueueRequest
  ExtractionManifest: ExtractionManifest
  ExtractionMethod: ExtractionMethod
  FieldEnrichmentRequest: FieldEnrichmentRequest
  FileExtraction: DocumentManifest['extractions'][number]
  InferenceHostState: InferenceHostState
  InferenceHostConfig: InferenceHostConfig
  InferenceHostConnection: InferenceHostConnection
  InferenceModel: InferenceModel
  InferenceModelState: InferenceModelState
  LegacyFile: LegacyFile
  LibraryManifest: LibraryManifest
  ProcessingRequestSettings: Record<string, string | number | boolean> | null
  StorageStats: StorageStats
  VectorStoreChunk: VectorStoreChunk
  WorkerSlotEntry: WorkerSlotEntry
  WorkspaceManifest: WorkspaceManifest
  WorkspaceRole: WorkspaceRole
  WorkspaceSettings: WorkspaceManifest['settings']
}
