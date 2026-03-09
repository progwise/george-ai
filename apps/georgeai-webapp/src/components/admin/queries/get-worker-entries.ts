import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getWorkersFn = createServerFn({ method: 'GET' }).handler(async () => {
  const result = await backendRequest(
    graphql(`
      query workers {
        workers {
          workerId
          workerRole
          lastHeartbeat
        }
      }
    `),
    {},
  )

  return result.workers
})

export const getWorkerEntriesQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.WorkerEntries],
    queryFn: () => getWorkersFn(),
  })
