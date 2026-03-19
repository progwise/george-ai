import { z } from 'zod'

import { InferenceDriverSchema } from '@george-ai/app-schema'

import { BaseManifestSchema } from './base-manifest-schema'

export const WorkspaceSettingsSchema = z.object({
  storageLimitFiles: z.number().int().nonnegative().optional(),
  storageLimitBytes: z.number().optional(),
  embedding: z
    .object({
      modelDriver: InferenceDriverSchema,
      modelName: z.string(),
    })
    .optional(),
  imageAnalysis: z
    .object({
      modelDriver: InferenceDriverSchema,
      modelName: z.string(),
    })
    .optional(),
})

export const WorkspaceManifestSchema = BaseManifestSchema.extend({
  type: z.literal('workspace'),
  name: z.string().min(3),
  settings: WorkspaceSettingsSchema.optional(),
})
