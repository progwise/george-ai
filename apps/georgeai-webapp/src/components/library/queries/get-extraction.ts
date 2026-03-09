import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { ExtractionMethod } from '../../../gql/graphql'
import { ExtractionMethodSchema } from '../../../gql/validation'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetExtractionParameterSchema = z.object({
  libraryId: z.string().nonempty(),
  fileId: z.string().nonempty(),
  extractionMethod: ExtractionMethodSchema.optional(),
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
