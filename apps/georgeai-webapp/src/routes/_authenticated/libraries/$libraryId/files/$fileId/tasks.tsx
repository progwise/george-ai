import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { PROCESSING_REQUEST_TYPES, getProcessingRequestType } from '@george-ai/app-commons'

import { getProcessingRequestsQueryOptions } from '../../../../../../components/library/queries/get-processing-requests'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/tasks')({
  component: RouteComponent,
  validateSearch: z.object({
    startSequence: z.coerce.number().optional(),
    take: z.coerce.number().default(20),
    requestType: z.enum(PROCESSING_REQUEST_TYPES).optional(),
  }),
  loaderDeps: ({ search: { startSequence, take } }) => ({
    startSequence,
    take,
  }),
})

function RouteComponent() {
  const { libraryId, fileId } = Route.useParams()
  const { startSequence, take, requestType } = Route.useSearch()

  const { data, isLoading, error } = useQuery(
    getProcessingRequestsQueryOptions({
      libraryId,
      fileId,
      startSequence,
      take,
      requestType: !requestType ? undefined : getProcessingRequestType(requestType),
    }),
  )

  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      <h1 className="text-2xl font-bold">Processing Tasks for file {fileId}</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-error">Error: {(error as Error).message}</div>}
      {data && (
        <div>
          <p>Total Requests: {data.totalCount}</p>
          <p>Last Sequence: {data.lastSequence}</p>
          <ul>
            {data.items.map((item) => (
              <li key={item.id}>
                <p>ID: {item.id}</p>
                <p>Subject: {item.subject}</p>
                <p>Delivery Count: {item.deliveryCount}</p>
                {item.error && <p className="text-error">Error: {item.error}</p>}
                {item.request && (
                  <div className="ml-4">
                    <p>Request Type: {item.request.requestType}</p>
                    <p>Subject: {item.subject}</p>
                    <p>
                      Raw: <pre>{item.rawText}</pre>
                    </p>
                    {/* Add more details about the request as needed */}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
