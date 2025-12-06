import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const triggerAutomationFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().nonempty().parse(id))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation triggerAutomation($id: ID!) {
          triggerAutomation(id: $id) {
            success
            message
            batchId
          }
        }
      `),
      { id: ctx.data },
    )
  })

export const triggerAutomationItemFn = createServerFn({ method: 'POST' })
  .inputValidator((automationItemId: string) => z.string().nonempty().parse(automationItemId))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation triggerAutomationItem($automationItemId: ID!) {
          triggerAutomationItem(automationItemId: $automationItemId) {
            success
            message
            batchId
          }
        }
      `),
      { automationItemId: ctx.data },
    )
  })
