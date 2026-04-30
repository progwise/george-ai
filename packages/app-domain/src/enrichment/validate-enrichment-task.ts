import { Prisma } from '@george-ai/app-database'

import { EnrichmentMetadataSchema } from './schema/enrichment-metadata-schema'

export const validateEnrichmentTask = (enrichmentTask: Prisma.AiEnrichmentTaskGetPayload<object>) => {
  const metadata = JSON.parse(enrichmentTask.metadata || '{}')
  const parsed = EnrichmentMetadataSchema.safeParse(metadata)
  return parsed
}
