import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getLanguageModelsForEmbedding = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query aiLanguageModels($canDoEmbedding: Boolean, $canDoChatCompletion: Boolean) {
        aiLanguageModels(canDoEmbedding: $canDoEmbedding, canDoChatCompletion: $canDoChatCompletion) {
          id
          name
          provider
        }
      }
    `),
    { canDoEmbedding: true },
  )
})

export const getLanguageModelsForEmbeddingQueryOptions = () => ({
  queryKey: ['aiLanguageModels', 'embedding'],
  queryFn: () => getLanguageModelsForEmbedding(),
})

const getLanguageModelsForChat = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query aiLanguageModelsForChat($canDoEmbedding: Boolean, $canDoChatCompletion: Boolean) {
        aiLanguageModels(canDoEmbedding: $canDoEmbedding, canDoChatCompletion: $canDoChatCompletion) {
          id
          name
          provider
        }
      }
    `),
    { canDoChatCompletion: true },
  )
})

export const getLanguageModelsForChatQueryOptions = () => ({
  queryKey: ['aiLanguageModels', 'chat'],
  queryFn: () => getLanguageModelsForChat(),
})
