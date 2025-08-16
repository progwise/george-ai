import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { getLanguage } from '../../i18n'
import { backendRequest } from '../../server-functions/backend'
import { getListFieldFormSchema } from './field-modal'

export const updateListField = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getListFieldFormSchema('update', language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    console.log('data', data)
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
          order: data.order ? parseInt(data.order) : undefined,
          fileProperty: data.fileProperty || null,
          useMarkdown: data.useMarkdown,
          context: data.context || null,
        },
      },
    )
  })
