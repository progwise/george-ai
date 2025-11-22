import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { AiListFieldContextInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'
import { ListFieldFormInput } from '../field-modal'

// Extend form input with contextSources (handled via state, not form schema)
type UpdateListFieldInput = ListFieldFormInput & {
  contextSources?: AiListFieldContextInput[]
}

export const updateListFieldFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: UpdateListFieldInput) => {
    // Data is already validated and transformed on the client side
    // Server-side validation is for security - just verify the structure
    return data
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation updateListField($id: String!, $data: AiListFieldInput!) {
          updateListField(id: $id, data: $data) {
            id
            name
            type
            order
            sourceType
            fileProperty
            prompt
            failureTerms
            useVectorStore
            contentQuery
            languageModel {
              id
              provider
              name
            }
          }
        }
      `),
      {
        id: data.id,
        data: {
          name: data.name,
          type: data.type,
          sourceType: data.sourceType,
          languageModelId: data.languageModelId,
          prompt: data.prompt,
          failureTerms: data.failureTerms,
          contentQuery: data.contentQuery,
          order: data.order ? parseInt(data.order) : undefined,
          fileProperty: data.fileProperty || null,
          useVectorStore: data.useVectorStore,
          contextSources: data.contextSources || null,
        },
      },
    )
  })
