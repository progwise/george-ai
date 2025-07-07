import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const dropFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const dropFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation dropFile($id: String!) {
            dropFile(fileId: $id) {
              id
              name
            }
          }
        `),
        { id: fileId },
      ),
    )
    return await Promise.all(dropFilePromises)
  })

export const clearEmbeddedFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const dropVectorStore = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation clearEmbeddedFiles($libraryId: String!) {
            clearEmbeddedFiles(libraryId: $libraryId)
          }
        `),
        { libraryId: fileId },
      ),
    )
    return await Promise.all(dropVectorStore)
  })

export const deleteAiLibraryUpdate = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation deleteAiLibraryUpdate($libraryId: String!) {
          deleteAiLibraryUpdate(libraryId: $libraryId) {
            id
          }
        }
      `),
      { libraryId: ctx.data },
    )
    return result
  })

export const reprocessFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reprocessFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation reprocessFile($id: String!) {
            processFile(fileId: $id) {
              id
              name
              chunks
              size
              uploadedAt
              processedAt
              processingErrorMessage
            }
          }
        `),
        { id: fileId },
      ),
    )
    return await Promise.all(reprocessFilePromises)
  })
