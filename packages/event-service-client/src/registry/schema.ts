import z from 'zod'

import { InferenceHostConnectionSchema, InferenceModelSchema } from '@george-ai/app-schema'

import { REGISTRY_ENTRY_TYPES } from './common'

export const BaseConfigSchema = z.object({
  version: z.literal(1).default(1),
  type: z.enum(REGISTRY_ENTRY_TYPES),
  lastUpdate: z.coerce.date().optional(),
})

export const InferenceHostConfigBaseSchema = BaseConfigSchema.extend({
  type: z.literal('inference-host').default('inference-host'),
  hostId: z.string(),
  name: z.string().optional(),
  enabled: z.boolean(),
  configuredVramGb: z.number().optional(),
  connection: InferenceHostConnectionSchema,
})

export const InferenceHostConfigSchema = InferenceHostConfigBaseSchema.extend({
  workspaceId: z.string(),
})

export type InferenceHostConfig = z.infer<typeof InferenceHostConfigSchema>

export const WorkspaceConfigSchema = BaseConfigSchema.extend({
  type: z.literal('workspace').default('workspace'),
  name: z.string(),
  workspaceId: z.string(),
  inferenceHosts: z.array(InferenceHostConfigBaseSchema),
  inferenceModels: z.array(InferenceModelSchema),
}).strict()

export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>

export const RegistryEntrySchema = z.discriminatedUnion('type', [WorkspaceConfigSchema, InferenceHostConfigSchema])

export type RegistryEntry = z.infer<typeof RegistryEntrySchema>
