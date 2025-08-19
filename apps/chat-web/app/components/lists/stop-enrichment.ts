import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const stopEnrichmentSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
})

const stopEnrichmentDocument = graphql(`
  mutation StopListEnrichment($listId: String!, $fieldId: String!) {
    stopListEnrichment(listId: $listId, fieldId: $fieldId) {
      success
      queuedItems
      error
    }
  }
`)

export const stopEnrichment = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    const listId = data.get('listId')
    const fieldId = data.get('fieldId')
    return stopEnrichmentSchema.parse({ listId, fieldId })
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(stopEnrichmentDocument, {
      listId: data.listId,
      fieldId: data.fieldId,
    })
    return result.stopListEnrichment
  })
