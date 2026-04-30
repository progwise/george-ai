import { EmbeddingStatistic } from '@george-ai/vector-store'

import { builder } from '../builder'

builder.objectRef<EmbeddingStatistic>('EmbeddingStatistic').implement({
  description: 'Information about an embedding method used in the workspace',
  fields: (t) => ({
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: false }),
    modelName: t.exposeString('modelName', { nullable: true }),
    chunkCount: t.exposeInt('chunkCount', { nullable: false }),
  }),
})
