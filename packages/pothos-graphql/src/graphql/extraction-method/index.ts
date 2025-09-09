import { isVisionModel, ollamaResourceManager } from '@george-ai/ai-service-client'

import { builder } from '../builder'

console.log('Setting up: ExtractionMethodRegistry')

// Query to get available OCR models
builder.queryField('availableOCRModels', (t) =>
  t.field({
    type: ['String'],
    nullable: false,
    description: 'Get all available OCR-capable vision models',
    resolve: async () => {
      const models = await ollamaResourceManager.getAvailableModelNames()
      return models.filter((name) => isVisionModel(name))
    },
  }),
)
