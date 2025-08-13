import { createServerFn } from '@tanstack/react-start'

import { parseCommaList } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { getLanguage, translate } from '../../../i18n'
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

    // For SharePoint crawlers, validate the connection works using GraphQL mutation
    if (validatedData.uriType === 'sharepoint' && validatedData.sharepointAuth) {
      const validationResult = await backendRequest(
        graphql(`
          mutation validateSharePointConnection($uri: String!, $sharepointAuth: String!) {
            validateSharePointConnection(uri: $uri, sharepointAuth: $sharepointAuth) {
              success
              errorMessage
              errorType
            }
          }
        `),
        {
          uri: validatedData.uri,
          sharepointAuth: validatedData.sharepointAuth,
        },
      )

      const result = validationResult.validateSharePointConnection
      if (!result.success) {
        // Provide more specific error messages based on error type using translations
        let errorMessage: string

        switch (result.errorType) {
          case 'AUTHENTICATION_ERROR':
            errorMessage = translate('crawlers.validationSharePointAuthenticationError', language)
            break
          case 'NOT_FOUND':
            errorMessage = translate('crawlers.validationSharePointNotFound', language)
            break
          case 'NETWORK_ERROR':
            errorMessage = translate('crawlers.validationSharePointNetworkError', language)
            break
          case 'LIBRARY_NOT_FOUND':
            errorMessage = translate('crawlers.validationSharePointLibraryNotFound', language)
            if (result.errorMessage) {
              errorMessage += ` ${result.errorMessage}`
            }
            break
          default:
            errorMessage = translate('crawlers.validationSharePointUnknownError', language)
            break
        }

        throw new Error(errorMessage)
      }
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
          includePatterns: parseCommaList(data.includePatterns),
          excludePatterns: parseCommaList(data.excludePatterns),
          maxFileSize: data.maxFileSize,
          minFileSize: data.minFileSize,
          allowedMimeTypes: parseCommaList(data.allowedMimeTypes),
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
