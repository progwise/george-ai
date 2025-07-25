import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getChatModels = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query aiChatModels {
        aiChatModels {
          modelName
          title
        }
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
        aiEmbeddingModels {
          modelName
          title
        }
      }
    `),
  )
})

export const getEmbeddingModelsQueryOptions = () => ({
  queryKey: ['aiEmbeddingModels'],
  queryFn: () => getEmbeddingModels(),
})
export const getModelsQueryOptions = () => ({
  queryKey: ['aiEmbeddingModels'],
  queryFn: () => getChatModels(),
})
