import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

export const enableConnectorTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((connectorType: string) => z.string().min(1).parse(connectorType))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation enableConnectorType($connectorType: String!) {
          enableConnectorType(connectorType: $connectorType) {
            id
            connectorType
          }
        }
      `),
      { connectorType: ctx.data },
    ),
  )

export const disableConnectorTypeFn = createServerFn({ method: 'POST' })
  .inputValidator((connectorType: string) => z.string().min(1).parse(connectorType))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation disableConnectorType($connectorType: String!) {
          disableConnectorType(connectorType: $connectorType)
        }
      `),
      { connectorType: ctx.data },
    ),
  )
