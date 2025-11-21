import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { parseCommaList, validateFormData } from '@george-ai/web-utils'

import { graphql } from '../../../../gql'
import { CrawlerUriType } from '../../../../gql/graphql'
import { getLanguage, translate } from '../../../../i18n'
import { backendRequest } from '../../../../server-functions/backend'
import { getCrawlerFormSchema } from '../crawler-form'

export const updateCrawlerFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: FormData) => {
    const language = getLanguage()
    const uriType = z.nativeEnum(CrawlerUriType).parse(data.get('uriType'))
    const schema = getCrawlerFormSchema('update', uriType, language)
    const { data: validatedData, errors } = validateFormData(data, schema)

    if (errors) {
      throw new Error(errors.join(', '))
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
    const id = data.id

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
          includePatterns: parseCommaList(data.includePatterns),
          excludePatterns: parseCommaList(data.excludePatterns),
          maxFileSize: data.maxFileSize,
          minFileSize: data.minFileSize,
          allowedMimeTypes: parseCommaList(data.allowedMimeTypes),
          crawlerConfig: data.crawlerConfig,
          // cronJobActive: data.cronJobActive,
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
              : data.uriType === 'box'
                ? {
                    boxCustomerId: data.boxCustomerId,
                    boxToken: data.boxToken,
                  }
                : undefined,
      },
    )
  })
