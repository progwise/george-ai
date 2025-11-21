import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'
import { ListFieldFormInput } from '../field-modal'

export const addListFieldFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: ListFieldFormInput) => {
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
            contentQuery
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
          contentQuery: data.contentQuery,
          failureTerms: data.failureTerms,
          order: data.order ? parseInt(data.order) : undefined,
          fileProperty: data.fileProperty || null,
          useVectorStore: data.useVectorStore,
          contextSources: data.contextSources || null,
        },
      },
    )
  })
