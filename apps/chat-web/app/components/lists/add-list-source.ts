import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const addListSourceSchema = z.object({
  listId: z.string().nonempty(),
  libraryId: z.string().nonempty(),
})

export const addListSource = createServerFn({ method: 'POST' })
  .validator((data: { listId: string; libraryId: string }) => addListSourceSchema.parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation addListSource($listId: String!, $data: AiListSourceInput!) {
          addListSource(listId: $listId, data: $data) {
            id
            libraryId
            library {
              id
              name
              owner {
                name
              }
            }
          }
        }
      `),
      { 
        listId: ctx.data.listId, 
        data: { libraryId: ctx.data.libraryId } 
      },
    )
  })