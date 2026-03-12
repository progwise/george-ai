import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment CurrentUser on CurrentUser {
    userId
    name
    username
    email
    avatarUrl
    isAdmin
    selectedWorkspaceId
    defaultWorkspaceId
    lastLogin
  }
`)

const currentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query currentUser {
        currentUser {
          ...CurrentUser
        }
      }
    `),
  )

  return result.currentUser
})

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.CurrentUser],
    queryFn: () => currentUserFn(),
    staleTime: Infinity,
  })
