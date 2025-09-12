import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getMarkdown = createServerFn({ method: 'GET' })
  .validator((data: unknown) =>
    z
      .object({
        fileId: z.string().nonempty(),
        markdownFileName: z.string().nonempty().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query getMarkdown($fileId: String!, $markdownFileName: String) {
          aiLibraryFile(fileId: $fileId) {
            markdown(markdownFileName: $markdownFileName) {
              fileName
              content
            }
          }
        }
      `),
      { fileId: data.fileId, markdownFileName: data.markdownFileName },
    )
    return result
  })

export const getMarkdownQueryOptions = (params: { fileId: string; markdownFileName?: string }) => ({
  queryKey: ['Markdown', params],
  queryFn: () => getMarkdown({ data: { fileId: params.fileId, markdownFileName: params.markdownFileName } }),
})
