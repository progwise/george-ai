import { z } from 'zod'

import { BaseManifestSchema } from './base-manifest-schema'

export const LibraryManifestSchema = BaseManifestSchema.extend({
  type: z.literal('library'),
  libraryId: z.string().min(3),
  name: z.string().min(3),
})
