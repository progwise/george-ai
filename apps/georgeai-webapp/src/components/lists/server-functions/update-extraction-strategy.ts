import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const updateExtractionStrategyInputSchema = z.object({
  sourceId: z.string().nonempty(),
  extractionStrategy: z.string().nonempty(),
  extractionConfig: z.string().optional(),
})

export type UpdateExtractionStrategyInput = z.infer<typeof updateExtractionStrategyInputSchema>

export const updateExtractionStrategy = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateExtractionStrategyInput) => updateExtractionStrategyInputSchema.parse(data))
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation UpdateListSourceExtractionStrategy($sourceId: String!, $data: ExtractionStrategyInput!) {
          updateListSourceExtractionStrategy(sourceId: $sourceId, data: $data) {
            id
            extractionStrategy
            extractionConfig
          }
        }
      `),
      {
        sourceId: ctx.data.sourceId,
        data: {
          extractionStrategy: ctx.data.extractionStrategy,
          extractionConfig: ctx.data.extractionConfig,
        },
      },
    )
    return result.updateListSourceExtractionStrategy
  })
