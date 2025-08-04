import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { getLanguage } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'
import { getCrawlerFormData, getCrawlerFormSchema } from './crawler-form'

export const addCrawlerFunction = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const validatedData = getCrawlerFormSchema(language).parse(getCrawlerFormData(data))
    return validatedData
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return backendRequest(
      graphql(`
        mutation createAiLibraryCrawler(
          $libraryId: String!
          $data: AiLibraryCrawlerInput!
          $credentials: AiLibraryCrawlerCredentialsInput
        ) {
          createAiLibraryCrawler(libraryId: $libraryId, data: $data, credentials: $credentials) {
            id
          }
        }
      `),
      {
        libraryId: data.libraryId,
        data: {
          uri: data.uri,
          uriType: data.uriType,
          maxDepth: data.maxDepth,
          maxPages: data.maxPages,
          cronJob: data.cronJob,
        },
        credentials:
          data.uriType === 'smb'
            ? {
                username: data.username,
                password: data.password,
              }
            : undefined,
      },
    )
  })
