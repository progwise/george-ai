import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getProcessingRequestsQueryOptions } from '../../../../../../components/workspace/queries'
import { EventQueueAction } from '../../../../../../gql/graphql'
import { EventQueueActionSchema } from '../../../../../../gql/validation'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/tasks')({
  component: RouteComponent,
  validateSearch: z.object({
    startSequence: z.coerce.number().optional(),
    take: z.coerce.number().default(20),
    action: EventQueueActionSchema.optional(),
  }),
  loaderDeps: ({ search: { startSequence, take } }) => ({
    startSequence,
    take,
  }),
})

function RouteComponent() {
  const { workspaceId } = Route.useRouteContext()
  const { fileId } = Route.useParams()
  const { action, take, startSequence } = Route.useSearch()

  const { data, isLoading, error } = useQuery(
    getProcessingRequestsQueryOptions({
      workspaceId,
      action: !action ? EventQueueAction.DocumentExtraction : action,
      take,
      startSequence,
    }),
  )

  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      <h1 className="text-2xl font-bold">Processing Tasks for file {fileId}</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-error">Error: {(error as Error).message}</div>}
      {data && (
        <div>
          <p>Total Requests: {data.totalMessages}</p>
          <p>Last Sequence: {data.lastSequence}</p>
          <ul>
            {data.requests.map((item) => (
              <li key={`item-${item.action}-${item.timestamp}`}>
                <div>Action {item.action}</div>
                <div>Time {item.timestamp}</div>
                <pre>
                  <code lang="json">{JSON.stringify(item)}</code>
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
