import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

interface GetLanguageModelsParams {
  skip?: number
  take?: number
  search?: string
  canDoEmbedding?: boolean
  canDoChatCompletion?: boolean
  canDoVision?: boolean
}

const getLanguageModelsForEmbedding = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query aiLanguageModelsForEmbedding($canDoEmbedding: Boolean) {
        aiLanguageModels(canDoEmbedding: $canDoEmbedding) {
          skip
          take
          count
          models {
            id
            name
            provider
          }
        }
      }
    `),
    { canDoEmbedding: true },
  )
  return result.aiLanguageModels
})

export const getLanguageModelsForEmbeddingQueryOptions = () => ({
  queryKey: ['aiLanguageModels', 'embedding'],
  queryFn: () => getLanguageModelsForEmbedding(),
})

const getLanguageModelsForChat = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query aiLanguageModelsForChat($canDoEmbedding: Boolean, $canDoChatCompletion: Boolean) {
        aiLanguageModels(canDoEmbedding: $canDoEmbedding, canDoChatCompletion: $canDoChatCompletion) {
          skip
          take
          count
          models {
            id
            name
            provider
          }
        }
      }
    `),
    { canDoChatCompletion: true },
  )
  return result.aiLanguageModels
})

export const getLanguageModelsForChatQueryOptions = () => ({
  queryKey: ['aiLanguageModels', 'chat'],
  queryFn: () => getLanguageModelsForChat(),
})

// Generic query function with search and pagination support
const aiLanguageModelsQuery = graphql(`
  query aiLanguageModelsWithSearch(
    $skip: Int
    $take: Int
    $search: String
    $canDoEmbedding: Boolean
    $canDoChatCompletion: Boolean
    $canDoVision: Boolean
  ) {
    aiLanguageModels(
      skip: $skip
      take: $take
      search: $search
      canDoEmbedding: $canDoEmbedding
      canDoChatCompletion: $canDoChatCompletion
      canDoVision: $canDoVision
    ) {
      skip
      take
      count
      models {
        id
        name
        provider
      }
    }
  }
`)

const getLanguageModels = createServerFn({ method: 'GET' })
  .inputValidator((params: GetLanguageModelsParams) => params)
  .handler(async (ctx) => {
    const params = await ctx.data
    const result = await backendRequest(aiLanguageModelsQuery, {
      skip: params.skip ?? 0,
      take: params.take ?? 20,
      search: params.search,
      canDoEmbedding: params.canDoEmbedding,
      canDoChatCompletion: params.canDoChatCompletion,
      canDoVision: params.canDoVision,
    })
    return result.aiLanguageModels
  })

export const getLanguageModelsQueryOptions = (params: GetLanguageModelsParams = {}) =>
  queryOptions({
    queryKey: ['aiLanguageModels', params],
    queryFn: () => getLanguageModels({ data: params }),
  })
