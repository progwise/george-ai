import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { PROCESSING_REQUEST_TYPES } from '@george-ai/app-commons'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const processDocumentGraphqlDocument = graphql(`
  mutation processDocument($requestType: ProcessingRequestType!, $libraryId: String!, $documentId: String!) {
    processDocument(requestType: $requestType, libraryId: $libraryId, documentId: $documentId) {
      success
    }
  }
`)

const ProcessDocumentParameterSchema = z.object({
  requestType: z.enum(PROCESSING_REQUEST_TYPES),
  libraryId: z.string(),
  documentId: z.string(),
})

export const processDocumentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof ProcessDocumentParameterSchema>) => ProcessDocumentParameterSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(processDocumentGraphqlDocument, {
      requestType: data.requestType,
      libraryId: data.libraryId,
      documentId: data.documentId,
    })

    return result.processDocument
  })

const ProcessDocumentsParameterSchema = z.object({
  requestType: z.enum(PROCESSING_REQUEST_TYPES),
  libraryId: z.string(),
  documentIds: z.array(z.string()),
})

export const processDocumentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof ProcessDocumentsParameterSchema>) =>
    ProcessDocumentsParameterSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const results = await Promise.all(
      data.documentIds.map(async (documentId) => {
        const result = await backendRequest(processDocumentGraphqlDocument, {
          requestType: data.requestType,
          libraryId: data.libraryId,
          documentId: documentId,
        })
        return { ...result.processDocument, documentId }
      }),
    )
    return results
  })
