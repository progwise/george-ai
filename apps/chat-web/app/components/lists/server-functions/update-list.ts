import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { Language, getLanguage, translate } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'

export const getUpdateListSchema = (language: Language) =>
  z.object({
    id: z.string().nonempty(translate('lists.idRequired', language)),
    name: z.string().nonempty(translate('lists.nameRequired', language)),
  })

export const updateList = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getUpdateListSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation updateList($id: String!, $data: AiListInput!) {
          updateList(id: $id, data: $data) {
            id
          }
        }
      `),
      { id: data.id, data: { name: data.name } },
    )
  })
