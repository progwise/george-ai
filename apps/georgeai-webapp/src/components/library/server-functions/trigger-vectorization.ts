import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { ExtractionMethodSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const TriggerVectorizationParameterSchema = z.object({
  extractionMethod: ExtractionMethodSchema.optional(),
  libraryId: z.string(),
  documentId: z.string(),
})

export const triggerVectorizationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof TriggerVectorizationParameterSchema>) =>
    TriggerVectorizationParameterSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation triggerVectorization($extractionMethod: ExtractionMethod, $libraryId: String!, $documentId: String!) {
          triggerVectorization(extractionMethod: $extractionMethod, libraryId: $libraryId, documentId: $documentId) {
            success
          }
        }
      `),
      {
        extractionMethod: data.extractionMethod,
        libraryId: data.libraryId,
        documentId: data.documentId,
      },
    )

    return result.triggerVectorization
  })
