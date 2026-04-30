import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const dropAllLibraryDocumentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string }) => z.object({ libraryId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation clearLibraryDocuments($libraryId: String!) {
          clearFiles(libraryId: $libraryId)
        }
      `),
      data,
    )
  })

export const deleteDocumentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; documentId: string }) =>
    z.object({ libraryId: z.string().nonempty(), documentId: z.string().nonempty() }).parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation deleteLibraryDocument($libraryId: String!, $documentId: String!) {
          deleteDocument(libraryId: $libraryId, documentId: $documentId) {
            id
            name
          }
        }
      `),
      data,
    )
    return result.deleteDocument
  })

export const deleteDocumentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; documentIds: string[] }) =>
    z.object({ libraryId: z.string().nonempty(), documentIds: z.array(z.string().nonempty()) }).parse(data),
  )
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation deleteLibraryDocuments($libraryId: String!, $documentIds: [ID!]!) {
          deleteDocuments(libraryId: $libraryId, documentIds: $documentIds)
        }
      `),
      data,
    )
  })
