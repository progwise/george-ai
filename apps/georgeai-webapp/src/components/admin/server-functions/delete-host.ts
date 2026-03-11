import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteInferenceHostFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { hostId: string }) => data)
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation deleteInferenceHostFn($hostId: String!) {
          removeInferenceHost(hostId: $hostId)
        }
      `),
      data,
    )
    return result.removeInferenceHost
  })
