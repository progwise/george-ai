import {
  modelCalls,
  modelProvider,
  providerHealth,
  workerRegistry,
  workspaceProcessing,
} from '@george-ai/event-service-client'

import { AUTOMATION_ITEM_STATUS, BATCH_STATUS, TRIGGER_TYPE } from '../../domain/automation/constants'
import { CRAWLER_URI_TYPES } from '../../domain/crawler/crawler-uri-types'
import {
  LIST_FIELD_CONTEXT_TYPES,
  LIST_FIELD_FILE_PROPERTIES,
  LIST_FIELD_SOURCE_TYPES,
  LIST_FIELD_TYPES,
} from '../../domain/list'
import { builder } from '../builder'

builder.enumType('AutomationItemStatus', {
  values: AUTOMATION_ITEM_STATUS,
})

builder.enumType('BatchStatus', {
  values: BATCH_STATUS,
})

builder.enumType('TriggerType', {
  values: TRIGGER_TYPE,
})

builder.enumType('ExtractionMethod', {
  values: workspaceProcessing.EXTRACTION_METHODS,
})

builder.enumType('ModelCallType', {
  values: modelCalls.MODEL_CALL_TYPES,
})

builder.enumType('ProviderHealthStatus', {
  values: providerHealth.HEALTH_STATUS,
})

builder.enumType('ProcessingStatus', {
  values: workspaceProcessing.EVENT_PROCESSING_STATUS,
})

builder.enumType('ActionType', {
  values: workspaceProcessing.ACTION_TYPES,
})

builder.enumType('WorkerType', {
  values: workerRegistry.WORKER_TYPES,
})

builder.enumType('ModelProvider', {
  values: modelProvider.MODEL_PROVIDERS,
})

builder.enumType('ListFieldSourceType', {
  values: LIST_FIELD_SOURCE_TYPES,
})

builder.enumType('ListFieldType', {
  values: LIST_FIELD_TYPES,
})

builder.enumType('ListFieldFileProperty', {
  values: LIST_FIELD_FILE_PROPERTIES,
})

builder.enumType('CrawlerUriType', {
  values: CRAWLER_URI_TYPES,
})

builder.enumType('ListFieldContextType', {
  values: LIST_FIELD_CONTEXT_TYPES,
})
