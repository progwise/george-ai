import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../../domain/content-extraction/task-status'
import { builder } from '../builder'

export const ProcessingStatus = builder.enumType('ProcessingStatus', {
  values: PROCESSING_STATUS,
})

export const EmbeddingStatus = builder.enumType('EmbeddingStatus', {
  values: EMBEDDING_STATUS,
})

export const ExtractionStatus = builder.enumType('ExtractionStatus', {
  values: EXTRACTION_STATUS,
})
