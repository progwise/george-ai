import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const startSingleEnrichmentSchema = z.object({
  listId: z.string().nonempty('List ID is required'),
  fieldId: z.string().nonempty('Field ID is required'),
  fileId: z.string().nonempty('File ID is required'),
})

export const startSingleEnrichment = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const entries = Object.fromEntries(data)
    return startSingleEnrichmentSchema.parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation startSingleEnrichment($listId: String!, $fieldId: String!, $fileId: String!) {
          startSingleEnrichment(listId: $listId, fieldId: $fieldId, fileId: $fileId) {
            success
            error
          }
        }
      `),
      data,
    )
  })
