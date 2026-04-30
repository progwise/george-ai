import z from 'zod'

import { InferenceHostConnectionSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceResponseBaseSchema } from '../base-schema'

export const HealthStatusRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('healthStatus').default('healthStatus'),
  connection: InferenceHostConnectionSchema,
})

export type HealthStatusRequest = z.infer<typeof HealthStatusRequestSchema>

export const HealthStatusResponseSchema = WorkspaceResponseBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('healthStatus').default('healthStatus'),
  connection: InferenceHostConnectionSchema,
  success: z.literal(true),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  TimeToConnectMs: z.number().optional(),
})

export type HealthStatusResponse = z.infer<typeof HealthStatusResponseSchema>
