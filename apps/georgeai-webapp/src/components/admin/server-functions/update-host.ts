import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { InferenceHostInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

export const updateInferenceHostFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { hostId: string; input: InferenceHostInput }) => input)
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation updateInferenceHostFn($hostId: ID!, $data: InferenceHostInput!) {
          updateInferenceHost(hostId: $hostId, data: $data) {
            hostId
            driver
            name
            enabled
          }
        }
      `),
      data,
    )
    return result.updateInferenceHost
  })
