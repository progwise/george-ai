import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const toggleProviderMutationDocument = graphql(`
  mutation ToggleAiServiceProvider($id: ID!, $enabled: Boolean!) {
    toggleAiServiceProvider(id: $id, enabled: $enabled) {
      id
      enabled
    }
  }
`)

export const toggleProviderFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { id: string; enabled: boolean }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(toggleProviderMutationDocument, ctx.data)
    return result.toggleAiServiceProvider
  })
