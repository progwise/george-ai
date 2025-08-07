import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileContent = createServerFn({ method: 'GET' })
  .validator((data: { fileId: string; libraryId: string }) =>
    z
      .object({
        fileId: z.string().nonempty(),
        libraryId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const result = await backendRequest(
        graphql(`
          query getFileContent($fileId: String!, $libraryId: String!) {
            readFileMarkdown(fileId: $fileId, libraryId: $libraryId)
          }
        `),
        { fileId: data.fileId, libraryId: data.libraryId },
      )
      return result.readFileMarkdown || ''
    } catch (error) {
      console.error(`Error fetching file content for fileId ${data.fileId}:`, error)
      return null
    }
  })

export const getFileContentQueryOptions = (params: { fileId: string; libraryId: string }) => ({
  queryKey: ['fileContent', params],
  queryFn: () => getFileContent({ data: { fileId: params.fileId, libraryId: params.libraryId } }),
})
