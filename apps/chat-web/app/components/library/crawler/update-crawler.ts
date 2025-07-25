import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'
import { crawlerFormSchema, getCrawlerFormData } from './crawler-form'

export const updateCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    return crawlerFormSchema.parse(getCrawlerFormData(data))
  })
  .handler((ctx) => {
    const data = ctx.data
    const id = data.id

    return backendRequest(
      graphql(`
        mutation updateAiLibraryCrawler($id: String!, $data: AiLibraryCrawlerInput!) {
          updateAiLibraryCrawler(id: $id, data: $data) {
            id
          }
        }
      `),
      {
        id,
        data: {
          url: data.url,
          maxDepth: data.maxDepth,
          maxPages: data.maxPages,
          cronJob: data.cronJob,
        },
      },
    )
  })
