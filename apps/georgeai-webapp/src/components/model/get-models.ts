import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getChatModels = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query aiChatModels {
        aiChatModels
      }
    `),
  )
})

export const getChatModelsQueryOptions = () => ({
  queryKey: ['aiChatModels'],
  queryFn: () => getChatModels(),
})

const getEmbeddingModels = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query aiEmbeddingModels {
        aiEmbeddingModels
      }
    `),
  )
})

export const getEmbeddingModelsQueryOptions = () => ({
  queryKey: ['aiEmbeddingModels'],
  queryFn: () => getEmbeddingModels(),
})

const getLanguageModels = createServerFn({ method: 'GET' }).handler(async () => {
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
  queryFn: () => getLanguageModels(),
})
export const getModelsQueryOptions = () => ({
  queryKey: ['aiEmbeddingModels'],
  queryFn: () => getChatModels(),
})
