import z from 'zod'

import { InferenceDriverSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceStatusBaseSchema } from '../base-schema'

export const FieldEnrichmentRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('fieldEnrichment'),
  workspaceId: z.string().min(3),
  fieldId: z.string().min(3),
  // TODO: This will become very complicated....
  chatModelName: z.string().min(3),
  chatModelDriver: InferenceDriverSchema,
  valuePrompt: z.string().min(3),
  valueFormat: z.enum(['text', 'number', 'date']),
  notFoundValue: z.string().optional(),
  context: z.array(z.string()), //TODO: Just a placeholder
})

export type FieldEnrichmentRequest = z.infer<typeof FieldEnrichmentRequestSchema>

export const FieldEnrichmentStatusSchema = WorkspaceStatusBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('fieldEnrichment'),
  workspaceId: z.string().min(3),
  fieldId: z.string().min(3),
  value: z.string().optional(),
})

export type FieldEnrichmentStatus = z.infer<typeof FieldEnrichmentStatusSchema>
