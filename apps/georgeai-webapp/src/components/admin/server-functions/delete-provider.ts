import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const deleteProviderMutationDocument = graphql(`
  mutation DeleteModelProvider($id: ID!) {
    deleteModelProvider(id: $id)
  }
`)

export const deleteProviderFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async (ctx) => {
    const result = await backendRequest(deleteProviderMutationDocument, { id: ctx.data })
    return result.deleteModelProvider
  })
