import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { Language, getLanguage, translate } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'

export const getCreateListSchema = (language: Language) =>
  z.object({ name: z.string().nonempty(translate('lists.nameRequired', language)) })

export const createListFn = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getCreateListSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation createList($data: AiListInput!) {
          createList(data: $data) {
            id
          }
        }
      `),
      { data: ctx.data },
    )
  })
