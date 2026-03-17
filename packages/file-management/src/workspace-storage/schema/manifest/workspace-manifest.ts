import { z } from 'zod'

import { BaseManifestSchema } from './base-manifest-schema'

export const WorkspaceSettingsSchema = z.object({
  storageLimitFiles: z.number().int().nonnegative().optional(),
  storageLimitBytes: z.number().optional(),
  embedding: z
    .object({
      modelDriver: z.string(),
      modelName: z.string(),
    })
    .optional(),
  imageAnalysis: z
    .object({
      modelDriver: z.string(),
      modelName: z.string(),
    })
    .optional(),
})

export const WorkspaceManifestSchema = BaseManifestSchema.extend({
  type: z.literal('workspace'),
  name: z.string().min(3),
  settings: WorkspaceSettingsSchema.optional(),
})
