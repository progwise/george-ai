import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

export const deleteConnectorFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().min(1).parse(id))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation deleteConnector($id: ID!) {
          deleteConnector(id: $id)
        }
      `),
      { id: ctx.data },
    ),
  )
