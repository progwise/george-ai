import { getEmbeddingModels } from '@george-ai/langchain-chat/src/embedding-model'

import { builder } from '../builder'

console.log('Setting up: AiEmbeddingModels')

builder.prismaObject('AiEmbedding', {
  name: 'AiEmbedding',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    model: t.exposeString('model', { nullable: false }),
    provider: t.exposeString('provider', { nullable: false }),
    url: t.exposeString('url', { nullable: true }),
    headers: t.exposeString('headers', { nullable: true }),
    options: t.exposeString('options', { nullable: true }),
    library: t.relation('library', { nullable: false }),
    aiLibraryId: t.exposeString('aiLibraryId', { nullable: false }),
  }),
})

const AiEmbeddingModelOption = builder.objectRef<{ key: string; value: string }>('AiEmbeddingModelOption').implement({
  description: 'Options for AI Embedding Models',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
  }),
})

const AiEmbeddingModel = builder
  .objectRef<{
    modelName: string
    title: string
    type: string
    baseUrl?: string
    options: Record<string, string>[]
  }>('AiEmbeddingModel')
  .implement({
    description: 'AI Embedding Models available in the system',
    fields: (t) => ({
      modelName: t.exposeString('modelName', { nullable: false }),
      title: t.exposeString('title', { nullable: false }),
      type: t.exposeString('type', { nullable: false }),
      baseUrl: t.exposeString('baseUrl', { nullable: true }),
      options: t.field({
        nullable: true,
        type: [AiEmbeddingModelOption],
        resolve: (source) => {
          return source.options.map((option) => ({
            key: option.key,
            value: option.value,
          }))
        },
      }),
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
