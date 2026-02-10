import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { ModelProviderInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const createProviderMutationDocument = graphql(`
  mutation CreateModelProvider($data: ModelProviderInput!) {
    createModelProvider(data: $data) {
      id
      provider
      name
      enabled
    }
  }
`)

export const createProviderFn = createServerFn({ method: 'POST' })
  .inputValidator((data: ModelProviderInput) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(createProviderMutationDocument, { data: ctx.data })
    return result.createModelProvider
  })
