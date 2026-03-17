import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { ExtractionMethodSchema } from '../../../gql/validation'
import { backendRequest } from '../../../server-functions/backend'

const triggerExtractionGraphqlDocument = graphql(`
  mutation triggerExtraction($extractionMethod: ExtractionMethod, $libraryId: String!, $documentId: String!) {
    triggerExtraction(extractionMethod: $extractionMethod, libraryId: $libraryId, documentId: $documentId) {
      success
      documentManifest {
        documentId
        name
        sourceHash
        created
      }
      extractionMethod
    }
  }
`)

const TriggerExtractionParameterSchema = z.object({
  extractionMethod: ExtractionMethodSchema.optional(),
  libraryId: z.string(),
  documentId: z.string(),
})

export const triggerExtractionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof TriggerExtractionParameterSchema>) =>
    TriggerExtractionParameterSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(triggerExtractionGraphqlDocument, {
      extractionMethod: data.extractionMethod,
      libraryId: data.libraryId,
      documentId: data.documentId,
    })

    return result.triggerExtraction
  })
