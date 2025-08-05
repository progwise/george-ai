import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const fetchUnprocessedFilesInQueueCount = createServerFn({ method: 'GET' })
  .validator(() => ({}))
  .handler(async () => {
    return await backendRequest(
      graphql(`
        query unprocessedFilesInQueueCount {
          unprocessedFilesInQueueCount
        }
      `),
      {},
    )
  })

export const countUnprocessedFilesInQueue = () =>
  queryOptions({
    queryKey: ['unprocessedFilesInQueueCount'],
    queryFn: () => fetchUnprocessedFilesInQueueCount(),
  })
