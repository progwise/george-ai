import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { getLanguage } from '../../i18n'
import { backendRequest } from '../../server-functions/backend'
import { getListFieldFormSchema } from './field-modal'

export const addListField = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getListFieldFormSchema('create', language).parse(entries)
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
          order: data.order ? parseInt(data.order) : undefined,
          fileProperty: data.fileProperty || null,
          useMarkdown: data.useMarkdown,
          context: data.context || null,
        },
      },
    )
  })
