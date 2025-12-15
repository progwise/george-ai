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
  .handler(async (ctx) => {
    const data = await backendRequest(
      graphql(`
        query getItemDetail($itemId: String!) {
          aiListItem(id: $itemId) {
            id
            itemName
            chunkCount
            extractionIndex
            metadata
            contentUrl
            sourceFileId
            sourceFile {
              id
              name
              libraryId
            }
            extraction {
              extractionMethod
              extractionMethodParameter
              displayName
              isBucketed
              totalParts
            }
          }
        }
      `),
      { itemId: ctx.data.itemId },
    )

    return data.aiListItem
  })

export const getItemDetailQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ['getItemDetail', itemId],
    queryFn: () => getItemDetail({ data: { itemId } }),
  })
