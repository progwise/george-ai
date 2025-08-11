import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteAllUpdates = createServerFn({ method: 'POST' })
  .validator((libraryId: string) => z.string().nonempty().parse(libraryId))
  .handler(async ({ data: libraryId }) => {
    const result = await backendRequest(
      graphql(`
        mutation deleteAiLibraryUpdates($libraryId: String!) {
          deleteAiLibraryUpdates(libraryId: $libraryId)
        }
      `),
      { libraryId },
    )
    return result
  })
