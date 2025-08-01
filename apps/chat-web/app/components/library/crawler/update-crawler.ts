import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { getLanguage } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'
import { getCrawlerFormData, getCrawlerFormSchema } from './crawler-form'

export const updateCrawlerFunction = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    return getCrawlerFormSchema(language).parse(getCrawlerFormData(data))
  })
  .handler(async (ctx) => {
    const data = await ctx.data
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
          uri: data.uri,
          uriType: data.uriType,
          maxDepth: data.maxDepth,
          maxPages: data.maxPages,
          cronJob: data.cronJob,
        },
      },
    )
  })
