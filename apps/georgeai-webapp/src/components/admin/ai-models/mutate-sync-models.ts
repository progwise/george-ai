import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const syncModels = createServerFn({ method: 'POST' }).handler(async () => {
  return await backendRequest(
    graphql(`
      mutation SyncModels {
        syncModels {
          success
          modelsDiscovered
          errors
        }
      }
    `),
    {},
  )
})
