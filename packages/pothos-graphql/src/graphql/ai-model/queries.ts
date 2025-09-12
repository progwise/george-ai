import { ollamaResourceManager } from '@george-ai/ai-service-client'
import { isChatModel, isEmbeddingModel, isVisionModel } from '@george-ai/ai-service-client/src/model-classifier'

import { builder } from '../builder'

console.log('Setting up: Ai Chat Models')

builder.queryField('aiChatModels', (t) =>
  t.field({
    type: ['String'],
    nullable: false,
    resolve: async () => {
      const models = await ollamaResourceManager.getAvailableModelNames()
      // Filter out non-chat models
      return models.filter((name) => isChatModel(name))
    },
  }),
)

builder.queryField('aiEmbeddingModels', (t) =>
  t.field({
    type: ['String'],
    nullable: false,
    resolve: async () => {
      const models = await ollamaResourceManager.getAvailableModelNames()
      return models.filter((name) => isEmbeddingModel(name))
    },
  }),
)

builder.queryField('aiVisionModels', (t) =>
  t.field({
    type: ['String'],
    nullable: false,
    resolve: async () => {
      const models = await ollamaResourceManager.getAvailableModelNames()
      return models.filter((name) => isVisionModel(name))
    },
  }),
)
