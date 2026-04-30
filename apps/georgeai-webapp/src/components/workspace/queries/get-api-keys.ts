import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const GetWorkspaceApiKeysParametersSchema = z.object({
  workspaceId: z.string(),
})

const getWorkspaceApiKeysFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetWorkspaceApiKeysParametersSchema>) =>
    GetWorkspaceApiKeysParametersSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        query WorkspaceApiKeys {
          workspaceApiKeys {
            id
            name
            workspaceId
            userId
            createdAt
            lastUsedAt
          }
        }
      `),
      data,
    )
    return result.workspaceApiKeys
  })

export const getWorkspaceApiKeysQueryOptions = (parameters: { workspaceId: string }) =>
  queryOptions({
    queryKey: [queryKeys.ApiKeys, parameters],
    queryFn: () => getWorkspaceApiKeysFn({ data: parameters }),
  })
