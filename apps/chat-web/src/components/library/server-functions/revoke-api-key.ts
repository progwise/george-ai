import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const revokeApiKeyMutationDocument = graphql(`
  mutation RevokeApiKey($id: String!) {
    revokeApiKey(id: $id)
  }
`)

export const revokeApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(({ id }: { id: string }) => ({
    id: z.string().nonempty().parse(id),
  }))
  .handler(async (ctx) => {
    const result = await backendRequest(revokeApiKeyMutationDocument, {
      id: ctx.data.id,
    })
    return result.revokeApiKey
  })
