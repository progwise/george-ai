import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { Language, getLanguage, translate } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'

// Export schema function for form validation
export const getRemoveFromQueueSchema = (language: Language) =>
  z.object({
    listId: z.string().nonempty(translate('lists.idRequired', language)),
    fieldId: z.string().nonempty(translate('lists.fields.fieldIdRequired', language)),
    fileId: z.string().nonempty(translate('lists.files.fileIdRequired', language)),
  })

// Server function using FormData
export const removeFromEnrichmentQueue = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getRemoveFromQueueSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation removeFromEnrichmentQueue($listId: String!, $fieldId: String!, $fileId: String!) {
          removeFromEnrichmentQueue(listId: $listId, fieldId: $fieldId, fileId: $fileId) {
            success
            queuedItems
            error
          }
        }
      `),
      { listId: data.listId, fieldId: data.fieldId, fileId: data.fileId },
    )
  })
