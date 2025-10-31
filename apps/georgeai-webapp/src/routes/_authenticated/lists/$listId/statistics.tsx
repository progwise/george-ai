import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { getEnrichmentsStatisticsQueryOptions, getListQueryOptions } from '../../../../components/lists/queries'
import { EnrichmentStatus } from '../../../../gql/graphql'

export const Route = createFileRoute('/_authenticated/lists/$listId/statistics')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getEnrichmentsStatisticsQueryOptions(params.listId))
  },
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  const {
    data: { aiListEnrichmentsStatistics: statistics },
  } = useSuspenseQuery(getEnrichmentsStatisticsQueryOptions(listId))

  const statusCounts = statistics.reduce(
    (acc, stat) => {
      acc[EnrichmentStatus.Completed] += stat.completedTasksCount
      acc[EnrichmentStatus.Failed] += stat.failedTasksCount
      acc[EnrichmentStatus.Pending] += stat.pendingTasksCount
      acc[EnrichmentStatus.Processing] += stat.processingTasksCount
      return acc
    },
    {
      [EnrichmentStatus.Completed]: 0,
      [EnrichmentStatus.Failed]: 0,
      [EnrichmentStatus.Error]: 0,
      [EnrichmentStatus.Pending]: 0,
      [EnrichmentStatus.Processing]: 0,
      [EnrichmentStatus.Canceled]: 0, // Assuming Canceled is not tracked in stats
    } as Record<EnrichmentStatus, number>,
  )

  const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  const statisticsArray = Object.entries(statusCounts).map(([status, count]) => ({
    status: status as EnrichmentStatus,
    count,
  }))
  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Statistics for {aiList.name}</h1>
      <div>
        <div className="badge badge-lg badge-ghost px-3 py-2">Total Enrichments: {totalCount}</div>
        {statisticsArray.map(({ status, count }) => (
          <div
            key={status}
            className={twMerge(
              'badge badge-lg ml-2 px-3 py-2',
              count === 0 && 'opacity-50',
              status === EnrichmentStatus.Processing && 'badge-primary',
              status === EnrichmentStatus.Pending && 'badge-info',
              status === EnrichmentStatus.Completed && 'badge-success',
              status === EnrichmentStatus.Error && 'badge-error',
              status === EnrichmentStatus.Failed && 'badge-warning',
              status === EnrichmentStatus.Canceled && 'badge-info',
            )}
          >
            {status}: {count}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="table-zebra table w-full">
          <thead>
            <tr>
              <th>Field Name</th>
              <th className="text-right">Items</th>
              <th className="text-right">Cached</th>
              <th className="text-right">Values</th>
              <th className="text-right">Completed Tasks</th>
              <th className="text-right">Error Tasks</th>
              <th className="text-right">Failed Tasks</th>
              <th className="text-right">Pending Tasks</th>
              <th className="text-right">Processing Tasks</th>
            </tr>
          </thead>
          <tbody>
            {statistics?.map((stat) => (
              <tr key={stat.fieldId}>
                <td>{stat.fieldName}</td>
                <td className="text-right">{stat.itemCount}</td>
                <td className="text-right">{stat.cacheCount}</td>
                <td className="text-right">{stat.valuesCount}</td>
                <td className="text-right">{stat.completedTasksCount}</td>
                <td className="text-right">{stat.errorTasksCount}</td>
                <td className="text-right">{stat.failedTasksCount}</td>
                <td className="text-right">{stat.pendingTasksCount}</td>
                <td className="text-right">{stat.processingTasksCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
