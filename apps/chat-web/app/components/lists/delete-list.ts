import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

export const deleteList = createServerFn({ method: 'POST' })
  .validator((id: string) => z.string().nonempty().parse(id))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteList($id: String!) {
          deleteList(id: $id)
        }
      `),
      { id: ctx.data },
    )
  })
