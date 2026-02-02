import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { ActionType } from '../../../gql/graphql'
import { backendRequest } from '../../../server-functions/backend'

export const startProcessingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { actionType: ActionType }) => data)
  .handler(async (ctx) => {
    console.log('Starting processing with data:', ctx.data)
    const result = await backendRequest(
      graphql(`
        mutation StartWorkspaceProcessing($actionType: ActionType!) {
          startEventProcessing(actionType: $actionType) {
            success
          }
        }
      `),
      { ...ctx.data },
    )
    return result
  })
