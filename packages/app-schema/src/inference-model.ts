import z from 'zod'

import { InferenceDriverSchema } from './inference'

export const InferenceModelSchema = z.object({
  version: z.literal(1),
  name: z.string(),
  driver: InferenceDriverSchema,
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type InferenceModel = z.infer<typeof InferenceModelSchema>
