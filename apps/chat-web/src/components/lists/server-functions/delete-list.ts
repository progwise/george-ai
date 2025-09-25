import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteListFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().nonempty().parse(id))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteList($id: String!) {
          deleteList(id: $id) {
            id
            name
          }
        }
      `),
      { id: ctx.data },
    )
  })
