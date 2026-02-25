import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteLibraryFn = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteLibrary($libraryId: String!) {
          deleteLibrary(libraryId: $libraryId)
        }
      `),
      { libraryId: ctx.data },
    )
  })
