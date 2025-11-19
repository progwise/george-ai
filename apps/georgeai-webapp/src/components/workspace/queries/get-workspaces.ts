import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const workspacesQueryDocument = graphql(`
  query GetWorkspaces {
    workspaces {
      id
      name
      slug
      isDefault
      createdAt
      updatedAt
    }
  }
`)

const getWorkspaces = createServerFn({ method: 'GET' }).handler(async () => {
  const { workspaces } = await backendRequest(workspacesQueryDocument, {})
  return workspaces
})

export const getWorkspacesQueryOptions = () =>
  queryOptions({
    queryKey: ['workspaces'],
    queryFn: () => getWorkspaces(),
  })
