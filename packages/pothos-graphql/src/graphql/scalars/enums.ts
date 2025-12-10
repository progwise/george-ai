import { AUTOMATION_ITEM_STATUS, BATCH_STATUS, TRIGGER_TYPE } from '../../domain/automation/constants'
import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../../domain/content-extraction/task-status'
import { CRAWLER_URI_TYPES } from '../../domain/crawler/crawler-uri-types'
import {
  LIST_FIELD_CONTEXT_TYPES,
  LIST_FIELD_FILE_PROPERTIES,
  LIST_FIELD_SOURCE_TYPES,
  LIST_FIELD_TYPES,
} from '../../domain/list'
import { builder } from '../builder'

builder.enumType('ProcessingStatus', {
  values: PROCESSING_STATUS,
})

builder.enumType('EmbeddingStatus', {
  values: EMBEDDING_STATUS,
})

builder.enumType('ExtractionStatus', {
  values: EXTRACTION_STATUS,
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

builder.enumType('AutomationItemStatus', {
  values: AUTOMATION_ITEM_STATUS,
})

builder.enumType('BatchStatus', {
  values: BATCH_STATUS,
})

builder.enumType('TriggerType', {
  values: TRIGGER_TYPE,
})
