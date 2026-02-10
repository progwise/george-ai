import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

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
    models(
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
      items {
        id
        name
        provider
      }
    }
  }
`)

const getLanguageModels = createServerFn({ method: 'GET' })
  .inputValidator((params: unknown) =>
    z
      .object({
        skip: z.number().optional(),
        take: z.number().optional(),
        search: z.string().optional(),
        canDoEmbedding: z.boolean().optional(),
        canDoChatCompletion: z.boolean().optional(),
        canDoVision: z.boolean().optional(),
      })
      .parse(params),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(aiLanguageModelsQuery, data)
    return result.models
  })

export const getLanguageModelsQueryOptions = (
  parameters: {
    skip?: number
    take?: number
    search?: string
    canDoEmbedding?: boolean
    canDoChatCompletion?: boolean
    canDoVision?: boolean
  } = {},
) =>
  queryOptions({
    queryKey: [queryKeys.AiLanguageModels, parameters],
    queryFn: () => getLanguageModels({ data: parameters }),
  })
