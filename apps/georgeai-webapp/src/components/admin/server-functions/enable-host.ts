import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const enableInferenceHostFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { hostId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation enableInferenceHostFn($hostId: String!) {
          enableInferenceHost(hostId: $hostId) {
            hostId
            enabled
          }
        }
      `),
      ctx.data,
    )
    return result.enableInferenceHost
  })
