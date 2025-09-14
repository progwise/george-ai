import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const startEnrichmentSchema = z.object({
  listId: z.string().nonempty(),
  fieldId: z.string().nonempty(),
})

const startEnrichmentDocument = graphql(`
  mutation StartListEnrichment($listId: String!, $fieldId: String!) {
    startListEnrichment(listId: $listId, fieldId: $fieldId) {
      success
      queuedItems
      error
    }
  }
`)

export const startEnrichment = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    const listId = data.get('listId')
    const fieldId = data.get('fieldId')
    return startEnrichmentSchema.parse({ listId, fieldId })
  })
  .handler(async (ctx) => {
    const data = ctx.data
    const result = await backendRequest(startEnrichmentDocument, {
      listId: data.listId,
      fieldId: data.fieldId,
    })
    return result.startListEnrichment
  })
