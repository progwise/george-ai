import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { getEnrichmentsQueryOptions, getListQueryOptions } from '../../../../components/lists/queries'
import { graphql } from '../../../../gql'
import { EnrichmentStatus } from '../../../../gql/graphql'

graphql(`
  fragment ListStatistics_AiList on AiList {
    id
    name
    statistics {
      fieldId
      fieldName
      itemCount
      cacheCount
      valuesCount
      completedTasksCount
      failedTasksCount
      pendingTasksCount
      processingTasksCount
    }
  }
`)

export const Route = createFileRoute('/_authenticated/lists/$listId/statistics')({
  component: RouteComponent,
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  const {
    data: {
      aiListEnrichments: { totalCount, statusCounts },
    },
  } = useSuspenseQuery(
    getEnrichmentsQueryOptions({
      listId,
      skip: 0,
      take: 0,
    }),
  )
  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Statistics for {aiList.name}</h1>
      <div>
        <div className="badge badge-lg badge-ghost px-3 py-2">Total Enrichments: {totalCount}</div>
        {statusCounts.map(({ status, count }) => (
          <div
            key={status}
            className={twMerge(
              'badge badge-lg ml-2 px-3 py-2',
              count === 0 && 'opacity-50',
              status === EnrichmentStatus.Processing && 'badge-primary',
              status === EnrichmentStatus.Pending && 'badge-info',
              status === EnrichmentStatus.Completed && 'badge-success',
              status === EnrichmentStatus.Failed && 'badge-error',
              status === EnrichmentStatus.Canceled && 'badge-warning',
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
              <th className="text-right">Failed Tasks</th>
              <th className="text-right">Pending Tasks</th>
              <th className="text-right">Processing Tasks</th>
            </tr>
          </thead>
          <tbody>
            {aiList.statistics?.map((stat) => (
              <tr key={stat.fieldId}>
                <td>{stat.fieldName}</td>
                <td className="text-right">{stat.itemCount}</td>
                <td className="text-right">{stat.cacheCount}</td>
                <td className="text-right">{stat.valuesCount}</td>
                <td className="text-right">{stat.completedTasksCount}</td>
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
