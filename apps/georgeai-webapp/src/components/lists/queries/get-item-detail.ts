import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getItemDetailArgsSchema = z.object({
  itemId: z.string(),
})

const getItemDetail = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof getItemDetailArgsSchema>) => getItemDetailArgsSchema.parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        query getItemDetail($itemId: String!) {
          aiListItem(id: $itemId) {
            id
            itemName
            extractionIndex
            content
            metadata
            sourceFileId
            sourceFile {
              id
              name
              libraryId
            }
            extraction {
              id
              extractionInput
              extractionOutput
              error
              itemsCreated
            }
          }
        }
      `),
      { itemId: ctx.data.itemId },
    ),
  )

export const getItemDetailQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ['getItemDetail', itemId],
    queryFn: () => getItemDetail({ data: { itemId } }),
  })
