import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workspaceWorkersDocument = graphql(`
  query GetWorkspaceWorkers {
    workspaceWorkers {
      workerId
      healthy
      lastHeartbeatAt
      activeSubscriptions {
        workspaceId
        processingType
        subscribedAt
      }
    }
  }
`)

const getWorkspaceWorkers = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { workspaceWorkers } = await backendRequest(workspaceWorkersDocument, ctx.data)
  return workspaceWorkers
})

export const getWorkspaceWorkersQueryOptions = (enabled?: boolean) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceWorkers, { enabled }],
    queryFn: () => getWorkspaceWorkers(),
  })
