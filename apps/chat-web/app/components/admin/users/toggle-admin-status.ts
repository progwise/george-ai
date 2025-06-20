import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const toggleAdminStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.string().nonempty() }))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation toggleAdminStatus($userId: String!) {
          toggleAdminStatus(userId: $userId) {
            id
            isAdmin
            username
          }
        }
      `),
      { userId: ctx.data.userId },
    ),
  )
