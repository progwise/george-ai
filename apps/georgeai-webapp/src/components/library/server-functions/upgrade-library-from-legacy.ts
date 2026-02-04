import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const upgradeLibraryFromLegacyFn = createServerFn({ method: 'POST' })
  .inputValidator((libraryId: string) => ({ libraryId: z.string().nonempty().parse(libraryId) }))
  .handler(async ({ data }) => {
    const response = await backendRequest(
      graphql(`
        mutation upgradeLibraryFromLegacy($libraryId: String!) {
          upgradeLibraryFromLegacy(libraryId: $libraryId)
        }
      `),
      {
        ...data,
      },
    )
    return response.upgradeLibraryFromLegacy
  })
