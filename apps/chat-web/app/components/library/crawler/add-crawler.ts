import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { getLanguage } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'
import { getCrawlerFormData, getCrawlerFormSchema } from './crawler-form'

export const addCrawlerFunction = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const rawData = getCrawlerFormData(data)
    
    // Parse and validate with Zod schema - this gives us proper typing
    const validatedData = getCrawlerFormSchema(language).parse(rawData)
    
    // Additional validation for credentials
    if (validatedData.uriType === 'sharepoint' && !validatedData.sharepointAuth) {
      throw new Error('SharePoint crawlers require authentication cookies')
    }
    if (validatedData.uriType === 'smb' && (!validatedData.username || !validatedData.password)) {
      throw new Error('SMB crawlers require username and password')
    }
    
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
            : data.uriType === 'sharepoint'
              ? {
                  sharepointAuth: data.sharepointAuth,
                }
              : undefined,
      },
    )
  })
