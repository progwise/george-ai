import z from 'zod'

import { InferenceHostConnectionSchema } from '@george-ai/app-schema'

import { InferenceModelLoadStateSchema, StateItemTypeSchema } from './common'

export const StateBaseItemSchema = z.object({
  version: z.literal(1),
  type: StateItemTypeSchema,
  workspaceId: z.string().min(3),
})

export const InferenceModelStateSchema = StateBaseItemSchema.extend({
  type: z.literal('inferenceModel'),
  hostId: z.string().min(3),

  loadState: InferenceModelLoadStateSchema,
  modelName: z.string().min(3),
  connection: InferenceHostConnectionSchema,

  callCount: z.number().default(0),
  errorCount: z.number().default(0),
  responseTimeMsPerToken: z.number().optional(),
})

export type InferenceModelState = z.infer<typeof InferenceModelStateSchema>

export const InferenceHostStateSchema = StateBaseItemSchema.extend({
  type: z.literal('inferenceHost'),

  state: z.enum(['healthy', 'unknown']),
  hostId: z.string().min(3),
  connection: InferenceHostConnectionSchema,

  totalMemoryMb: z.number().optional(),
  usedMemoryMb: z.number().optional(),
  processorUsagePercent: z.number().optional(),
  lastHealthCheck: z.coerce.date().optional(),
  lastTestConnection: z.coerce.date().optional(),
})

export type InferenceHostState = z.infer<typeof InferenceHostStateSchema>

export const StateItemSchema = z.discriminatedUnion('type', [InferenceModelStateSchema, InferenceHostStateSchema])
export type StateItem = z.infer<typeof StateItemSchema>
