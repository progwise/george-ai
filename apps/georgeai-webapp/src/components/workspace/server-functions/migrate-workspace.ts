import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const migrateWorkspaceMutationDocument = graphql(`
  mutation MigrateWorkspace {
    migrateWorkspace
  }
`)

export const migrateWorkspaceFn = createServerFn({ method: 'POST' }).handler(async () => {
  const result = await backendRequest(migrateWorkspaceMutationDocument)
  return result.migrateWorkspace
})
