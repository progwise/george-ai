import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { EventQueueAction } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

export const stopProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data) =>
    z
      .object({
        action: z.nativeEnum(EventQueueAction),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const result = await backendRequest(
      graphql(`
        mutation StopWorkspaceProcessing($action: EventQueueAction!) {
          stopProcessing(action: $action) {
            action
            status
            error
            pending
            delivered
            redelivered
            waiting
          }
        }
      `),
      data,
    )
    return result
  })
