import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const createNewLibraryFn = createServerFn({ method: 'POST' })
  .inputValidator(async (data: FormData) => {
    return z
      .object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
      .parse(Object.fromEntries(data))
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation createLibrary($data: AiLibraryInput!) {
          createLibrary(data: $data) {
            id
            name
          }
        }
      `),
      {
        data: {
          name: data.name,
          description: data.description,
        },
      },
    )
  })
