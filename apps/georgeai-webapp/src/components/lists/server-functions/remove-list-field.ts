import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { Language, getLanguage, translate } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'

export const getRemoveListFieldSchema = (language: Language) =>
  z.object({
    id: z.string().nonempty(translate('lists.fields.fieldIdRequired', language)),
  })

export const removeListField = createServerFn({ method: 'POST' })
  .inputValidator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getRemoveListFieldSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation removeListField($id: String!) {
          removeListField(id: $id) {
            id
          }
        }
      `),
      {
        id: data.id,
      },
    )
  })
