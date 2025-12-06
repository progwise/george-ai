import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteAutomationFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().nonempty().parse(id))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteAutomation($id: ID!) {
          deleteAutomation(id: $id)
        }
      `),
      { id: ctx.data },
    )
  })
