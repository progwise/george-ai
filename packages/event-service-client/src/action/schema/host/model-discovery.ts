import z from 'zod'

import { InferenceHostConnectionSchema, InferenceModelSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceResponseBaseSchema } from '../base-schema'

export const ModelDiscoveryRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('modelDiscovery').default('modelDiscovery'),
  connection: InferenceHostConnectionSchema,
})

export type ModelDiscoveryRequest = z.infer<typeof ModelDiscoveryRequestSchema>

export const ModelDiscoveryResponseSchema = WorkspaceResponseBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('modelDiscovery').default('modelDiscovery'),
  connection: InferenceHostConnectionSchema,
  models: z.array(InferenceModelSchema),
})

export type ModelDiscoveryResponse = z.infer<typeof ModelDiscoveryResponseSchema>
