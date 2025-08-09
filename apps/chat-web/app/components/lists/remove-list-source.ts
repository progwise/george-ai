import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

export const removeListSource = createServerFn({ method: 'POST' })
  .validator((id: string) => z.string().nonempty().parse(id))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation removeListSource($id: String!) {
          removeListSource(id: $id) {
            id
          }
        }
      `),
      { id: ctx.data },
    )
  })
