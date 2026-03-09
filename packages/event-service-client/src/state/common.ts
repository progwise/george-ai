import z from 'zod'

import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('event-service-client:state')
export const STATE_BUCKET_NAME = 'george-state'

export const STATE_ITEM_TYPES = ['inferenceModel', 'inferenceHost'] as const
export const StateItemTypeSchema = z.enum(STATE_ITEM_TYPES)
export type StateItemType = z.infer<typeof StateItemTypeSchema>

export const INFERENCE_MODEL_LOAD_STATE = ['installed', 'loaded'] as const
export const InferenceModelLoadStateSchema = z.enum(INFERENCE_MODEL_LOAD_STATE)
export type InferenceModelLoadState = z.infer<typeof InferenceModelLoadStateSchema>
