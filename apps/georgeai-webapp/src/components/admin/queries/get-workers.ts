import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workersDocument = graphql(`
  query GetWorkspaceWorkers {
    workers {
      workerId
      healthy
      lastHeartbeatAt
      workerType
    }
  }
`)

const getWorkspaceWorkers = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const { workers } = await backendRequest(workersDocument, ctx.data)
  return workers
})

export const getWorkspaceWorkersQueryOptions = (enabled?: boolean) =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceWorkers, { enabled }],
    queryFn: () => getWorkspaceWorkers(),
  })
