import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

// Server functions
const getAiLanguageModels = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
        providers: z.array(z.string()).optional(),
        capabilities: z.array(z.string()).optional(),
        onlyUsed: z.boolean().default(false),
        showDisabled: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query GetAiLanguageModels(
          $skip: Int = 0
          $take: Int = 20
          $providers: [String!]
          $canDoEmbedding: Boolean
          $canDoChatCompletion: Boolean
          $canDoVision: Boolean
          $canDoFunctionCalling: Boolean
          $onlyUsed: Boolean = false
          $showDisabled: Boolean = false
        ) {
          aiLanguageModels(
            skip: $skip
            take: $take
            providers: $providers
            canDoEmbedding: $canDoEmbedding
            canDoChatCompletion: $canDoChatCompletion
            canDoVision: $canDoVision
            canDoFunctionCalling: $canDoFunctionCalling
            onlyUsed: $onlyUsed
            showDisabled: $showDisabled
          ) {
            skip
            take
            count
            enabledCount
            disabledCount
            providerCapabilities {
              provider
              modelCount
              enabledCount
              disabledCount
              embeddingCount
              chatCount
              visionCount
              functionCount
            }
            models {
              id
              name
              provider
              canDoEmbedding
              canDoChatCompletion
              canDoVision
              canDoFunctionCalling
              enabled
              adminNotes
              lastUsedAt
              createdAt
              librariesUsingAsEmbedding {
                id
                name
              }
              assistantsUsingAsChat {
                id
                name
              }
              listFieldsUsing {
                id
                list {
                  id
                  name
                }
              }
            }
          }
        }
      `),
      {
        skip: ctx.data.skip,
        take: ctx.data.take,
        providers: ctx.data.providers?.length ? ctx.data.providers : undefined,
        canDoEmbedding: ctx.data.capabilities?.includes('embedding') ? true : undefined,
        canDoChatCompletion: ctx.data.capabilities?.includes('chat') ? true : undefined,
        canDoVision: ctx.data.capabilities?.includes('vision') ? true : undefined,
        canDoFunctionCalling: ctx.data.capabilities?.includes('functions') ? true : undefined,
        onlyUsed: ctx.data.onlyUsed,
        showDisabled: ctx.data.showDisabled,
      },
    )
    return result.aiLanguageModels
  })

// Query options
export const aiLanguageModelsQueryOptions = (params: {
  skip: number
  take: number
  providers?: string[]
  capabilities?: string[]
  onlyUsed?: boolean
  showDisabled?: boolean
}) =>
  queryOptions({
    queryKey: [queryKeys.AiLanguageModels, { ...params }],
    queryFn: () =>
      getAiLanguageModels({
        data: {
          skip: params.skip,
          take: params.take,
          providers: params.providers,
          capabilities: params.capabilities,
          onlyUsed: params.onlyUsed ?? false,
          showDisabled: params.showDisabled ?? false,
        },
      }),
  })
