import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const dropAllLibraryFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string }) => z.object({ libraryId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation dropAllLibraryFiles($libraryId: String!) {
          dropAllLibraryFiles(libraryId: $libraryId)
        }
      `),
      data,
    )
  })

export const deleteLibraryFileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; fileId: string }) =>
    z.object({ libraryId: z.string().nonempty(), fileId: z.string().nonempty() }).parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation deleteLibraryFile($libraryId: String!, $fileId: String!) {
          deleteLibraryFile(libraryId: $libraryId, fileId: $fileId) {
            id
            name
          }
        }
      `),
      data,
    )
    return result.deleteLibraryFile
  })

export const deleteLibraryFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { libraryId: string; fileIds: string[] }) =>
    z.object({ libraryId: z.string().nonempty(), fileIds: z.array(z.string().nonempty()) }).parse(data),
  )
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation deleteLibraryFiles($libraryId: String!, $fileIds: [ID!]!) {
          deleteLibraryFiles(libraryId: $libraryId, fileIds: $fileIds)
        }
      `),
      data,
    )
  })
