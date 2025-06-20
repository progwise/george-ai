import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const ensureUserProfile = createServerFn({ method: 'POST' })
  .validator((data: object) => z.object({ userId: z.string().nonempty() }).parse(data))
  .handler(async (ctx) =>
    backendRequest(
      graphql(`
        mutation ensureUserProfile($userId: String!) {
          ensureUserProfile(userId: $userId) {
            id
          }
        }
      `),
      { userId: ctx.data.userId },
    ),
  )
