import { z } from 'zod'

import { BaseManifestSchema } from './base-manifest-schema'

export const WorkspaceManifestSchema = BaseManifestSchema.extend({
  type: z.literal('workspace'),
  name: z.string().min(3),
  settings: z
    .object({
      storageLimitFiles: z.number().int().nonnegative().optional(),
      storageLimitBytes: z.number().optional(),
      embedding: z
        .object({
          embeddingModelProvider: z.string(),
          embeddingModelName: z.string(),
        })
        .optional(),
      imageAnalysis: z
        .object({
          imageAnalysisModelProvider: z.string(),
          imageAnalysisModelName: z.string(),
        })
        .optional(),
    })
    .optional(),
})
