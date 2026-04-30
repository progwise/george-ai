import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const deleteWorkspaceDocument = graphql(`
  mutation DeleteWorkspace {
    deleteWorkspace
  }
`)

export const deleteWorkspaceFn = createServerFn({ method: 'POST' }).handler(async () => {
  const result = await backendRequest(deleteWorkspaceDocument)
  return result.deleteWorkspace
})
