import z from 'zod'

import { InferenceHostConnectionSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceResponseBaseSchema } from '../base-schema'

export const ConnectionTestRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('connectionTest'),
  connection: InferenceHostConnectionSchema,
})

export type ConnectionTestRequest = z.infer<typeof ConnectionTestRequestSchema>

export const ConnectionTestResponseSchema = WorkspaceResponseBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('connectionTest'),
  connection: InferenceHostConnectionSchema,
  success: z.boolean(),
  isHealthy: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  statusMessage: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  TimeToConnectMs: z.number().optional(),
})

export type ConnectionTestResponse = z.infer<typeof ConnectionTestResponseSchema>
