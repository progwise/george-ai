import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { AiListFieldContextInput } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'
import { ListFieldFormInput } from '../field-modal'

// Extend form input with contextSources (handled via state, not form schema)
type AddListFieldInput = ListFieldFormInput & {
  contextSources?: AiListFieldContextInput[]
}

export const addListFieldFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: AddListFieldInput) => {
    // Data is already validated and transformed on the client side
    // Server-side validation is for security - just verify the structure
    return data
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation addListField($listId: String!, $data: AiListFieldInput!) {
          addListField(listId: $listId, data: $data) {
            id
            name
            type
            order
            sourceType
            fileProperty
            prompt
            failureTerms
            languageModel {
              name
            }
          }
        }
      `),
      {
        listId: data.listId,
        data: {
          name: data.name,
          type: data.type,
          sourceType: data.sourceType,
          languageModelId: data.languageModelId,
          prompt: data.prompt,
          failureTerms: data.failureTerms,
          order: data.order ? parseInt(data.order) : undefined,
          fileProperty: data.fileProperty || null,
          contextSources: data.contextSources || null,
        },
      },
    )
  })
