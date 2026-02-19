import { EMBEDDING_STATUS, EXTRACTION_METHODS, PROCESSING_REQUEST_TYPES } from '@george-ai/app-commons'
import {
  CRAWLER_URI_TYPES,
  LIST_FIELD_CONTEXT_TYPES,
  LIST_FIELD_FILE_PROPERTIES,
  LIST_FIELD_SOURCE_TYPES,
  LIST_FIELD_TYPES,
} from '@george-ai/app-domain'
import { modelCalls, providerHealth, workerRegistry, workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../builder'

// TODO: Should be moved to the specific folders. This file shoud become empty.

builder.enumType('CrawlerUriType', {
  values: CRAWLER_URI_TYPES,
})

builder.enumType('EmbeddingStatus', {
  values: EMBEDDING_STATUS,
})

builder.enumType('EventProcessingStatus', {
  values: workspaceProcessing.EVENT_PROCESSING_STATUS,
})

builder.enumType('ExtractionMethod', {
  values: EXTRACTION_METHODS,
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

builder.enumType('ListFieldContextType', {
  values: LIST_FIELD_CONTEXT_TYPES,
})

builder.enumType('ModelCallType', {
  values: modelCalls.MODEL_CALL_TYPES,
})

builder.enumType('ProviderHealthStatus', {
  values: providerHealth.HEALTH_STATUS,
})

builder.enumType('ProcessingRequestType', {
  values: PROCESSING_REQUEST_TYPES,
})

builder.enumType('SortOrder', {
  values: ['asc', 'desc'],
})

builder.enumType('WorkerType', {
  values: workerRegistry.WORKER_TYPES,
})
