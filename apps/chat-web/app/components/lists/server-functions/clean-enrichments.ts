import { createServerFn } from '@tanstack/start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const CleanEnrichmentsDocument = graphql(`
  mutation CleanEnrichments($listId: String!, $fieldId: String!) {
    cleanListEnrichments(listId: $listId, fieldId: $fieldId) {
      createdTasksCount
      cleanedUpTasksCount
      cleanedUpEnrichmentsCount
    }
  }
`)

const cleanEnrichmentsSchema = z.object({
  listId: z.string().min(1),
  fieldId: z.string().min(1),
})

export const cleanEnrichments = createServerFn({
  method: 'POST',
})
  .validator((formData: FormData) => {
    const data = Object.fromEntries(formData)
    return cleanEnrichmentsSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const result = await backendRequest(CleanEnrichmentsDocument, {
      listId: data.listId,
      fieldId: data.fieldId,
    })

    return result.cleanListEnrichments
  })
