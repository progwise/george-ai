import { getChatModels } from '@george-ai/langchain-chat/src/assistant-model'

import { builder } from '../builder'

console.log('Setting up: Ai Chat Models')

const AiChatModelOption = builder.objectRef<{ key: string; value: string }>('AiChatModelOption').implement({
  description: 'Options for AI Models',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
  }),
})

const AiChatModel = builder
  .objectRef<{
    modelName: string
    title: string
    type: string
    baseUrl?: string
    options: Record<string, string>[]
  }>('AiChatModel')
  .implement({
    description: 'AI Chat Models available in the system',
    fields: (t) => ({
      modelName: t.exposeString('modelName', { nullable: false }),
      title: t.exposeString('title', { nullable: false }),
      modelType: t.exposeString('type', { nullable: false }),
      baseUrl: t.exposeString('baseUrl', { nullable: true }),
      options: t.field({
        nullable: true,
        type: [AiChatModelOption],
        resolve: (source) => {
          return source.options.map((option) => ({
            key: option.key,
            value: option.value,
          }))
        },
      }),
    }),
  })

builder.queryField('aiChatModels', (t) =>
  t.field({
    type: [AiChatModel],
    nullable: false,
    resolve: async () => {
      const models = await getChatModels()
      return models
    },
  }),
)
