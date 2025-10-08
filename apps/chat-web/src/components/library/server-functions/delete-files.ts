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
  .inputValidator((data: { fileId: string }) => z.object({ fileId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation deleteLibraryFile($fileId: String!) {
          deleteLibraryFile(fileId: $fileId) {
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
  .inputValidator((data: { fileIds: string[] }) => z.object({ fileIds: z.array(z.string().nonempty()) }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation deleteLibraryFiles($fileIds: [ID!]!) {
          deleteLibraryFiles(fileIds: $fileIds)
        }
      `),
      data,
    )
  })

export const dropOutdatedMarkdownFilesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { fileId: string }) => z.object({ fileId: z.string().nonempty() }).parse(data))
  .handler(async ({ data }) => {
    return backendRequest(
      graphql(`
        mutation dropOutdatedMarkdownFiles($fileId: String!) {
          dropOutdatedMarkdowns(fileId: $fileId)
        }
      `),
      data,
    )
  })
