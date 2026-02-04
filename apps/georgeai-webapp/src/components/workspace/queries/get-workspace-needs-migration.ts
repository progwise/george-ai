import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getWorkspaceNeedsMigrationFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { workspaceNeedsMigration } = await backendRequest(
    graphql(`
      query getWorkspaceNeedsMigration {
        workspaceNeedsMigration {
          id
          name
          needsMigration
          hasWorkspaceStorage
          hasVectorStore
        }
      }
    `),
  )
  return workspaceNeedsMigration
})

export const getWorkspaceNeedsMigrationQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.WorkspaceNeedsMigration],
    // eslint-disable-next-line @tanstack/query/no-void-query-fn
    queryFn: () => {
      return getWorkspaceNeedsMigrationFn()
    },
  })
