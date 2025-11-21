import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

const getApiCrawlerTemplates = createServerFn({ method: 'GET' }).handler(async () => {
  return await backendRequest(
    graphql(`
      query GetApiCrawlerTemplates {
        apiCrawlerTemplates {
          id
          name
          description
          config
        }
      }
    `),
    {},
  )
})

export const getApiCrawlerTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ['apiCrawlerTemplates'],
    queryFn: () => getApiCrawlerTemplates(),
    staleTime: Infinity, // Templates don't change during a session
  })
