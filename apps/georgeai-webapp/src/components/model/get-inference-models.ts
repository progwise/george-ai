import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const GetInferenceModelsParameterSchema = z.object({
  workspaceId: z.string(),
  limit: z.number().int().nonnegative(),
  search: z.string().optional(),
  canDoEmbedding: z.boolean().optional(),
  canDoChatCompletion: z.boolean().optional(),
  canDoVision: z.boolean().optional(),
})

const getInferenceModels = createServerFn({ method: 'GET' })
  .inputValidator((params: z.infer<typeof GetInferenceModelsParameterSchema>) =>
    GetInferenceModelsParameterSchema.parse(params),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query GetInferenceModels(
          $workspaceId: String!
          $limit: Int!
          $search: String
          $canDoEmbedding: Boolean
          $canDoChatCompletion: Boolean
          $canDoVision: Boolean
        ) {
          inferenceModels(
            workspaceId: $workspaceId
            limit: $limit
            search: $search
            canDoEmbedding: $canDoEmbedding
            canDoChatCompletion: $canDoChatCompletion
            canDoVision: $canDoVision
          ) {
            count
            models {
              modelName
              modelDriver
              canDoEmbedding
              canDoChatCompletion
              canDoVision
            }
          }
        }
      `),
      data,
    )
    return result.inferenceModels
  })

export function getInferenceModelsQueryOptions(parameters: z.infer<typeof GetInferenceModelsParameterSchema>) {
  return queryOptions({
    queryKey: [queryKeys.InferenceModels, parameters],
    queryFn: () => getInferenceModels({ data: parameters }),
  })
}
