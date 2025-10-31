import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { Language, getLanguage, translate } from '../../../i18n'
import { backendRequest } from '../../../server-functions/backend'

// Export schema function for form validation
export const getStopEnrichmentSchema = (language: Language) =>
  z.object({
    listId: z.string().nonempty(translate('lists.idRequired', language)),
    fieldId: z.string().nonempty(translate('lists.fields.fieldIdRequired', language)),
    fileId: z.string().nonempty(translate('lists.files.fileIdRequired', language)),
  })

// Server function using FormData
export const stopEnrichmentFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: { listId: string; fieldId: string; fileId: string }) => {
    const language = getLanguage()
    return getStopEnrichmentSchema(language).parse(data)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    const result = await backendRequest(
      graphql(`
        mutation removeFromEnrichmentQueue($listId: String!, $fieldId: String!, $fileId: String!) {
          deletePendingEnrichmentTasks(listId: $listId, fieldId: $fieldId, fileId: $fileId) {
            createdTasksCount
            cleanedUpTasksCount
            cleanedUpEnrichmentsCount
          }
        }
      `),
      { listId: data.listId, fieldId: data.fieldId, fileId: data.fileId },
    )
    return result.deletePendingEnrichmentTasks
  })
