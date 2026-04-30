import z from 'zod'

import { InferenceDriverSchema } from './inference'

export const InferenceModelBaseSchema = z.object({
  version: z.literal(1).default(1),
  modelName: z.string(),
  modelDriver: InferenceDriverSchema,
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type InferenceModelBase = z.infer<typeof InferenceModelBaseSchema>

export const InferenceModelSchema = InferenceModelBaseSchema.extend({
  workspaceId: z.string(),
  enabled: z.boolean(),
})

export type InferenceModel = z.infer<typeof InferenceModelSchema>
