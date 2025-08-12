import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { Language, getLanguage, translate } from '../../i18n'
import { backendRequest } from '../../server-functions/backend'

export const getAddListFieldSchema = (language: Language) =>
  z.object({
    listId: z.string().nonempty(translate('lists.fields.listIdRequired', language)),
    name: z.string().nonempty(translate('lists.fields.nameRequired', language)),
    type: z.string().nonempty(translate('lists.fields.typeRequired', language)),
    sourceType: z.string().nonempty(translate('lists.fields.sourceTypeRequired', language)),
    languageModel: z.string().nonempty(translate('lists.fields.languageModelRequired', language)),
    prompt: z.string().nonempty(translate('lists.fields.promptRequired', language)),
    order: z.string().optional(),
    fileProperty: z.string().optional(),
    useMarkdown: z
      .string()
      .optional()
      .transform((val) => val === 'on'),
    context: z.array(z.string()).optional(),
  })

export const addListField = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    const contextIds = data.getAll('context') as string[]
    return getAddListFieldSchema(language).parse({
      ...entries,
      context: contextIds.length > 0 ? contextIds : undefined,
    })
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
