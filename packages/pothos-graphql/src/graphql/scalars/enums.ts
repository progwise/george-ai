import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../../domain/content-extraction/task-status'
import { LIST_FIELD_SOURCE_TYPES, LIST_FIELD_TYPES } from '../../domain/list'
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
