import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

export const updateUserAvatar = createServerFn({ method: 'POST' })
  .inputValidator((data: { avatarUrl?: string | null }) => {
    return z
      .object({
        avatarUrl: z.string().nullable().optional(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation updateUserAvatar($avatarUrl: String) {
          updateUserAvatar(avatarUrl: $avatarUrl) {
            id
            avatarUrl
          }
        }
      `),
      {
        avatarUrl: ctx.data.avatarUrl || null,
      },
    )
  })
