import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const updateAiLanguageModel = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; enabled?: boolean; adminNotes?: string }) => data)
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await backendRequest(
      graphql(`
        mutation UpdateAiLanguageModel($id: ID!, $data: UpdateAiLanguageModelInput!) {
          updateAiLanguageModel(id: $id, data: $data) {
            id
            enabled
            adminNotes
          }
        }
      `),
      {
        id,
        data: updateData,
      },
    )
  })
