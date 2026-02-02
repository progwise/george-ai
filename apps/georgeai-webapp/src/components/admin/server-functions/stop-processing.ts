import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { ActionType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

export const stopProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { actionType: ActionType }) => data)
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation StopWorkspaceProcessing($actionType: ActionType!) {
          stopEventProcessing(actionType: $actionType) {
            success
          }
        }
      `),
      { ...ctx.data },
    )
    return result
  })
