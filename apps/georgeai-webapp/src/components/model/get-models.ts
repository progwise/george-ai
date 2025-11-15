import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getLanguageModelsForEmbedding = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query aiLanguageModels($canDoEmbedding: Boolean, $canDoChatCompletion: Boolean) {
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
