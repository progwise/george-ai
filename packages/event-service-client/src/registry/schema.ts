import z from 'zod'

import { InferenceHostConnectionSchema, InferenceModelSchema } from '@george-ai/app-schema'

import { REGISTRY_ENTRY_TYPES } from './common'

export const BaseConfigSChema = z.object({
  version: z.literal(1),
  type: z.enum(REGISTRY_ENTRY_TYPES),
  lastUpdate: z.coerce.date().optional(),
})

export const WorkspaceConfigSchema = BaseConfigSChema.extend({
  type: z.literal('workspace'),
  workspaceId: z.string(),
  modelHosts: z.array(
    z.object({
      hostId: z.string().min(3),
      name: z.string().optional(),
      connection: InferenceHostConnectionSchema,
    }),
  ),
  activeModels: z.array(InferenceModelSchema),
}).strict()

export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>

export const InferenceHostConfigSchema = BaseConfigSChema.extend({
  type: z.literal('inference-host'),
  workspaceId: z.string(),
  hostId: z.string(),
  name: z.string().optional(),
  connection: InferenceHostConnectionSchema,
})

export type InferenceHostConfig = z.infer<typeof InferenceHostConfigSchema>

export const RegistryEntrySchema = z.discriminatedUnion('type', [WorkspaceConfigSchema, InferenceHostConfigSchema])

export type RegistryEntry = z.infer<typeof RegistryEntrySchema>
