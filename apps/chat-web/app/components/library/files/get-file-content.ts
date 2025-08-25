import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getFileContent = createServerFn({ method: 'GET' })
  .validator((data: object) =>
    z
      .object({
        fileId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const result = await backendRequest(
        graphql(`
          query getFileContent($fileId: String!) {
            readFileMarkdown(fileId: $fileId) {
              ...FileContentResult
            }
          }
        `),
        { fileId: data.fileId },
      )
      return result.readFileMarkdown
    } catch (error) {
      console.error(`Error fetching file content for fileId ${data.fileId}:`, error)
      throw error
    }
  })

export const getFileContentQueryOptions = (params: { fileId: string }) => ({
  queryKey: ['fileContent', params],
  queryFn: () => getFileContent({ data: { fileId: params.fileId } }),
})
