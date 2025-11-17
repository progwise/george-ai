import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { AiServiceProviderInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const createProviderMutationDocument = graphql(`
  mutation CreateAiServiceProvider($data: AiServiceProviderInput!) {
    createAiServiceProvider(data: $data) {
      id
      provider
      name
      enabled
    }
  }
`)

export const createProviderFn = createServerFn({ method: 'POST' })
  .inputValidator((data: AiServiceProviderInput) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(createProviderMutationDocument, { data: ctx.data })
    return result.createAiServiceProvider
  })
