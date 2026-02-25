import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-commons'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetExtractionParameterSchema = z.object({
  libraryId: z.string().nonempty(),
  fileId: z.string().nonempty(),
  extractionMethod: z.enum(EXTRACTION_METHODS).optional(),
  fragment: z.string().optional(),
})

const getExtraction = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetExtractionParameterSchema>) => GetExtractionParameterSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getExtraction($fileId: String!, $libraryId: String!, $extractionMethod: ExtractionMethod) {
          extraction(fileId: $fileId, libraryId: $libraryId, extractionMethod: $extractionMethod) {
            version
            extractionMethod
            extracted
            hasFragments
            fragmentCount
            sourceHash
            attachments {
              size
              fileName
              mimeType
            }
          }
        }
      `),
      data,
    )
    return result
  })

export function getExtractionQueryOptions(parameters: {
  fileId: string
  libraryId: string
  extractionMethod?: ExtractionMethod
}) {
  return queryOptions({
    queryKey: [queryKeys.Extraction, parameters],
    queryFn: () =>
      getExtraction({
        data: parameters,
      }),
  })
}
