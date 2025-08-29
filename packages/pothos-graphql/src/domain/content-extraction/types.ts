export const PROCESSING_STATUS = [
  'pending',
  'validating',
  'validationFailed',
  'extracting',
  'extractionFailed',
  'extractionFinished',
  'embedding',
  'embeddingFailed',
  'embeddingFinished',
  'completed',
  'timedOut',
  'failed',
] as const
export type ProcessingStatus = (typeof PROCESSING_STATUS)[number]

export const EXTRACTION_STATUS = ['pending', 'running', 'completed', 'failed'] as const
export type ExtractionStatus = (typeof EXTRACTION_STATUS)[number]

export const EMBEDDING_STATUS = ['pending', 'running', 'completed', 'failed'] as const
export type EmbeddingStatus = (typeof EMBEDDING_STATUS)[number]
