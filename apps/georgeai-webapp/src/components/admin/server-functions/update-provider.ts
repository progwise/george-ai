import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { AiServiceProviderInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const updateProviderMutationDocument = graphql(`
  mutation UpdateAiServiceProvider($id: ID!, $data: AiServiceProviderInput!) {
    updateAiServiceProvider(id: $id, data: $data) {
      id
      provider
      name
      enabled
    }
  }
`)

export const updateProviderFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { id: string; data: AiServiceProviderInput }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(updateProviderMutationDocument, ctx.data)
    return result.updateAiServiceProvider
  })
