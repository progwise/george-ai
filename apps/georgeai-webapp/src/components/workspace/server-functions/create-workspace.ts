import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const createWorkspaceMutationDocument = graphql(`
  mutation CreateWorkspace($name: String!, $slug: String!) {
    createWorkspace(name: $name, slug: $slug) {
      id
      name
      slug
      createdAt
    }
  }
`)

export const createWorkspaceFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { name: string; slug: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(createWorkspaceMutationDocument, ctx.data)
    return result.createWorkspace
  })
