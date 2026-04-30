import { z } from 'zod'

import { InferenceDriverSchema } from '@george-ai/app-schema'

import { BaseManifestSchema } from './base-manifest-schema'

export const WorkspaceSettingsSchema = z.object({
  storageLimitFiles: z.number().int().nonnegative().optional().nullable(),
  storageLimitBytes: z.number().optional().nullable(),
  embedding: z
    .object({
      modelDriver: InferenceDriverSchema,
      modelName: z.string(),
    })
    .optional()
    .nullable(),
  vision: z
    .object({
      modelDriver: InferenceDriverSchema,
      modelName: z.string(),
    })
    .optional()
    .nullable(),
})

export const WorkspaceManifestSchema = BaseManifestSchema.extend({
  type: z.literal('workspace'),
  name: z.string().min(3),
  settings: WorkspaceSettingsSchema.optional(),
})
