import { getExternalModels, getOllamalModels } from '@george-ai/langchain-chat/src/assistant-model'

import { builder } from '../builder'

console.log('Setting up: AiModels')

const AiModelOption = builder.objectRef<{ key: string; value: string }>('AiModelOption').implement({
  description: 'Options for AI Models',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
  }),
})

const AiModel = builder
  .objectRef<{
    modelName: string
    title: string
    type: string
    baseUrl?: string
    options: Record<string, string>[]
  }>('AiModel')
  .implement({
    description: 'AI Models available in the system',
    fields: (t) => ({
      modelName: t.exposeString('modelName', { nullable: false }),
      title: t.exposeString('title', { nullable: false }),
      modelType: t.exposeString('type', { nullable: false }),
      baseUrl: t.exposeString('baseUrl', { nullable: true }),
      options: t.field({
        nullable: true,
        type: [AiModelOption],
        resolve: (source) => {
          return source.options.map((option) => ({
            key: option.key,
            value: option.value,
          }))
        },
      }),
    }),
  })

builder.queryField('aiModels', (t) =>
  t.field({
    type: [AiModel],
    nullable: false,
    resolve: async () => {
      // This should be replaced with actual data fetching logic
      const externalModels = getExternalModels()
      const ollamaModels = await getOllamalModels()
      const models = [...externalModels, ...ollamaModels]
      return models
    },
  }),
)
