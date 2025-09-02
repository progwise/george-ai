import { getEmbeddingModels } from '@george-ai/ai-service-client'

import { builder } from '../builder'

console.log('Setting up: AiEmbeddingModels')

const AiEmbeddingModel = builder
  .objectRef<{
    name: string
    model: string
  }>('AiEmbeddingModel')
  .implement({
    description: 'AI Embedding Models available in the system',
    fields: (t) => ({
      name: t.exposeString('name', { nullable: false }),
      model: t.exposeString('model', { nullable: false }),
    }),
  })

builder.queryField('aiEmbeddingModels', (t) =>
  t.field({
    type: [AiEmbeddingModel],
    nullable: false,
    resolve: async () => {
      const models = await getEmbeddingModels()
      return models
    },
  }),
)
