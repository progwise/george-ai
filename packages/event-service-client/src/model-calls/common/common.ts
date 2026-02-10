import { createLogger } from '@george-ai/app-commons'

export const MODEL_CALL_TYPES = ['generateEmbedding', 'generateChatCompletion', 'generateImage'] as const
export type ModelCallType = (typeof MODEL_CALL_TYPES)[number]

export const MODEL_CALLS_STREAM_NAME = 'model_calls'
export const MODEL_CALLS_BATCH_SUBJECT_PREFIX = 'modelcalls.batch.workspace'
export const MODEL_CALLS_DIRECT_SUBJECT_PREFIX = 'modelcalls.direct.workspace'
export const MODEL_CALLS_STREAM_SUBJECTS = [`${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.>`]

export const logger = createLogger('event-service-client:model-calls')
