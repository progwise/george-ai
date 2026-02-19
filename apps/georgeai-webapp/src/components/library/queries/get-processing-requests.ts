import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { PROCESSING_REQUEST_TYPES, ProcessingRequestType } from '@george-ai/app-commons'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const processingRequestsDocument = graphql(`
  query ProcessingRequests(
    $requestType: ProcessingRequestType
    $libraryId: String
    $fileId: String
    $startSequence: Int
    $take: Int
  ) {
    processingRequests(
      requestType: $requestType
      libraryId: $libraryId
      documentId: $fileId
      startSequence: $startSequence
      take: $take
    ) {
      totalCount
      lastSequence
      items {
        id
        subject
        deliveryCount
        error
        rawText
        request {
          __typename
          version
          workspaceId
          requestType
          settings {
            key
            value
          }
          ... on ExtractDocumentRequest {
            libraryId
            documentId
            extractionMethod
          }
          ... on EmbedDocumentRequest {
            libraryId
            documentId
            extractionMethod
            embeddingModelProvider
            embeddingModelName
          }
          ... on EnrichItemRequest {
            libraryId
            documentId
            fragment
          }
        }
      }
    }
  }
`)

const getProcessingRequests = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) =>
    z
      .object({
        requestType: z.enum(PROCESSING_REQUEST_TYPES).optional(),
        libraryId: z.string().optional(),
        fileId: z.string().optional(),
        startSequence: z.number().optional(),
        take: z.number().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(processingRequestsDocument, data)
    return result.processingRequests
  })

export const getProcessingRequestsQueryOptions = (parameters: {
  requestType?: ProcessingRequestType | null
  libraryId?: string | null
  fileId?: string | null
  startSequence?: number
  take?: number
}) =>
  queryOptions({
    queryKey: [queryKeys.ProcessingRequests, parameters],
    queryFn: () => getProcessingRequests({ data: parameters }),
  })
