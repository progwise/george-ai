import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { getLanguage } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'
import { getCrawlerFormData, getCrawlerFormSchema } from './crawler-form'

export const updateCrawlerFunction = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const validatedData = getCrawlerFormSchema(language).parse(getCrawlerFormData(data))
    return validatedData
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    console.log('updatecrawler', data)
    const id = data.id

    if (!id) {
      throw new Error('Cannot update crawler without id')
    }
    if (data.uriType === 'smb' && (!data.username || !data.password)) {
      throw new Error('For smb crawlers you need to provide username and password')
    }
    if (data.uriType === 'sharepoint' && !data.sharepointAuth) {
      throw new Error('For sharepoint crawlers you need to provide sharepointAuth')
    }

    return backendRequest(
      graphql(`
        mutation updateAiLibraryCrawler(
          $id: String!
          $data: AiLibraryCrawlerInput!
          $credentials: AiLibraryCrawlerCredentialsInput
        ) {
          updateAiLibraryCrawler(id: $id, data: $data, credentials: $credentials) {
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
        credentials:
          data.uriType === 'smb'
            ? {
                username: data.username,
                password: data.password,
              }
            : data.uriType === 'sharepoint'
              ? {
                  sharepointAuth: data.sharepointAuth,
                }
              : undefined,
      },
    )
  })
