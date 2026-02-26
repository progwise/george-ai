import {
  EmbeddingStatus,
  ExtractionMethod,
  ModelProvider,
  ProcessingRequestType,
  ProviderHealthStatus,
  WorkerType,
  WorkspaceRole,
} from '@george-ai/app-commons'
import { AutomationItemStatus } from '@george-ai/app-database'
import {
  AutomationBatchStatus,
  AutomationTriggerType,
  CrawlerUriType,
  ListFieldContextType,
  ListFieldFileProperty,
  ListFieldSourceType,
  ListFieldType,
} from '@george-ai/app-domain'
import { EventProcessingStatus, ModelCallType, ProcessingStatus } from '@george-ai/event-service-client'

export type GeorgeEnumTypes = {
  AutomationBatchStatus: AutomationBatchStatus
  AutomationTriggerType: AutomationTriggerType
  AutomationItemStatus: AutomationItemStatus
  CrawlerUriType: CrawlerUriType
  EmbeddingStatus: EmbeddingStatus
  EventProcessingStatus: EventProcessingStatus
  ExtractionMethod: ExtractionMethod
  ListFieldSourceType: ListFieldSourceType
  ListFieldType: ListFieldType
  ListFieldContextType: ListFieldContextType
  ListFieldFileProperty: ListFieldFileProperty
  ModelCallType: ModelCallType
  ModelProvider: ModelProvider
  ProviderHealthStatus: ProviderHealthStatus
  ProcessingStatus: ProcessingStatus
  ProcessingRequestType: ProcessingRequestType
  WorkerType: WorkerType
  WorkspaceRole: WorkspaceRole
}
