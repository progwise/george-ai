import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { getLanguage } from '../../i18n'
import { backendRequest } from '../../server-functions/backend'
import { getListFieldFormSchema } from './field-modal'

export const updateListField = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    const useVectorStore = entries.useVectorStore === 'on'
    return getListFieldFormSchema('update', language, useVectorStore).parse(entries)
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
            contentQuery
            languageModel
          }
        }
      `),
      {
        id: data.id,
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
