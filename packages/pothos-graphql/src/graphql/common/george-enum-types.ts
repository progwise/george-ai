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
import {
  EnrichmentAction,
  EventQueueAction,
  EventQueueStatus,
  ExtractionMethod,
  InferenceAction,
  InferenceDriver,
  WorkerActionResult,
  WorkerRole,
  WorkspaceRole,
} from '@george-ai/app-schema'

export type GeorgeEnumTypes = {
  AutomationBatchStatus: AutomationBatchStatus
  AutomationTriggerType: AutomationTriggerType
  AutomationItemStatus: AutomationItemStatus
  CrawlerUriType: CrawlerUriType
  EnrichmentAction: EnrichmentAction
  EventQueueStatus: EventQueueStatus
  ExtractionMethod: ExtractionMethod
  EventQueueAction: EventQueueAction
  ListFieldSourceType: ListFieldSourceType
  ListFieldType: ListFieldType
  ListFieldContextType: ListFieldContextType
  ListFieldFileProperty: ListFieldFileProperty
  InferenceAction: InferenceAction
  InferenceDriver: InferenceDriver
  WorkerActionResult: WorkerActionResult
  WorkerRole: WorkerRole
  WorkspaceRole: WorkspaceRole
}
