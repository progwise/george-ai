import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

export const testConnectorConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().min(1).parse(id))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation testConnectorConnection($id: ID!) {
          testConnectorConnection(id: $id) {
            success
            message
            details
          }
        }
      `),
      { id: ctx.data },
    ),
  )
