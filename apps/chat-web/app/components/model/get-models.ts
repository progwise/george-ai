import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'

const getModels = createServerFn({ method: 'GET' }).handler(async () => {
  return backendRequest(
    graphql(`
      query aiModels {
        aiModels {
          modelName
          title
        }
      }
    `),
  )
})

export const getModelsQueryOptions = () => ({
  queryKey: ['aiModels'],
  queryFn: () => getModels(),
})
