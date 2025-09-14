import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { getLanguage } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'
import { getListFieldFormSchema } from './../field-modal'

export const addListField = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    const useVectorStore = entries.useVectorStore === 'on'
    return getListFieldFormSchema('create', language, useVectorStore).parse(entries)
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
            contentQuery
            languageModel
          }
        }
      `),
      {
        listId: data.listId,
        data: {
          name: data.name,
          type: data.type,
          sourceType: data.sourceType,
          languageModel: data.languageModel,
          prompt: data.prompt,
          contentQuery: data.contentQuery,
          order: data.order ? parseInt(data.order) : undefined,
          fileProperty: data.fileProperty || null,
          useVectorStore: data.useVectorStore,
          context: data.context || null,
        },
      },
    )
  })
