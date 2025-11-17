import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { TestProviderConnectionInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

const testProviderConnectionMutationDocument = graphql(`
  mutation TestProviderConnection($data: TestProviderConnectionInput!) {
    testProviderConnection(data: $data) {
      success
      message
      details
    }
  }
`)

export const testProviderConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: TestProviderConnectionInput): TestProviderConnectionInput => data)
  .handler(async (ctx) => {
    const result = await backendRequest(testProviderConnectionMutationDocument, {
      data: ctx.data,
    })
    return result.testProviderConnection
  })
