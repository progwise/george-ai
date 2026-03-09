import {
  CRAWLER_URI_TYPES,
  LIST_FIELD_CONTEXT_TYPES,
  LIST_FIELD_FILE_PROPERTIES,
  LIST_FIELD_SOURCE_TYPES,
  LIST_FIELD_TYPES,
} from '@george-ai/app-domain'
import { EMBEDDING_STATUS, EVENT_QUEUE_STATUS, EXTRACTION_METHODS, INFERENCE_ACTIONS } from '@george-ai/app-schema'

import { builder } from '../builder'

// TODO: Should be moved to the specific folders. This file shoud become empty.

builder.enumType('CrawlerUriType', {
  values: CRAWLER_URI_TYPES,
})

builder.enumType('EmbeddingStatus', {
  values: EMBEDDING_STATUS,
})

builder.enumType('EventQueueStatus', {
  values: EVENT_QUEUE_STATUS,
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

builder.enumType('InferenceAction', {
  values: INFERENCE_ACTIONS,
})

builder.enumType('SortOrder', {
  values: ['asc', 'desc'],
})
