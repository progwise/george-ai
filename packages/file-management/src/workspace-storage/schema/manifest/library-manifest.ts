import { z } from 'zod'

import { BaseManifestSchema } from './base-manifest-schema'

export const LibraryManifestSchema = BaseManifestSchema.extend({
  type: z.literal('library'),
  libraryId: z.string().min(3),
  name: z.string().min(3),
  settings: z
    .object({
      storageLimitFiles: z.number().int().nonnegative().optional(),
      storageLimitBytes: z.number().optional(),
      embedding: z
        .object({
          provider: z.enum(['openai', 'ollama']),
          modelName: z.string(),
        })
        .optional(),
      imageAnalysis: z
        .object({
          provider: z.enum(['openai', 'ollama']),
          modelName: z.string(),
          prompt: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})
