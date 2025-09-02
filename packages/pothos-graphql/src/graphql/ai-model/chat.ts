import { getChatModels } from '@george-ai/ai-service-client'

import { builder } from '../builder'

console.log('Setting up: Ai Chat Models')

const AiChatModel = builder
  .objectRef<{
    name: string
    model: string
  }>('AiChatModel')
  .implement({
    description: 'AI Chat Models available in the system',
    fields: (t) => ({
      name: t.exposeString('name', { nullable: false }),
      model: t.exposeString('model', { nullable: false }),
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
