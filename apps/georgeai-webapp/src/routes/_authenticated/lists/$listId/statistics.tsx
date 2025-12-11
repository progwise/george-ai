import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { getEnrichmentsStatisticsQueryOptions, getListQueryOptions } from '../../../../components/lists/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/lists/$listId/statistics')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getEnrichmentsStatisticsQueryOptions(params.listId))
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { listId } = Route.useParams()
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))

  const {
    data: { aiListEnrichmentsStatistics: statistics },
  } = useSuspenseQuery(getEnrichmentsStatisticsQueryOptions(listId))

  // Calculate totals for item count (same across all fields)
  const totalItems = statistics[0]?.itemCount ?? 0

  // Calculate queue totals (sum across all fields)
  const queueTotals = statistics.reduce(
    (acc, stat) => ({
      running: acc.running + stat.processingTasksCount,
      pending: acc.pending + stat.pendingTasksCount,
      completed: acc.completed + stat.completedTasksCount,
      errors: acc.errors + stat.errorTasksCount,
    }),
    { running: 0, pending: 0, completed: 0, errors: 0 },
  )

  const hasActiveQueue = queueTotals.running > 0 || queueTotals.pending > 0

  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lists.statistics.title', { name: aiList.name })}</h1>

      {/* Item Summary */}
      <div className="flex flex-wrap gap-2">
        <div className="badge badge-lg badge-ghost px-3 py-2">
          {t('lists.statistics.totalItems')}: {totalItems}
        </div>
        <div className="badge badge-lg px-3 py-2">
          {statistics.length} {t('lists.statistics.enrichmentFields')}
        </div>
      </div>

      {/* Queue Status - only show if there's activity */}
      {hasActiveQueue && (
        <div className="alert alert-info">
          <span>
            {t('lists.statistics.queueStatus')}:{' '}
            {queueTotals.running > 0 && (
              <span className="font-semibold">
                {queueTotals.running} {t('lists.statistics.running')}
              </span>
            )}
            {queueTotals.running > 0 && queueTotals.pending > 0 && ', '}
            {queueTotals.pending > 0 && (
              <span>
                {queueTotals.pending} {t('lists.statistics.queued')}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Data Quality Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('lists.statistics.dataQuality')}</h2>
        <div className="overflow-x-auto">
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>{t('lists.statistics.fieldName')}</th>
                <th className="text-right">{t('lists.statistics.items')}</th>
                <th className="text-success text-right">{t('lists.statistics.enriched')}</th>
                <th className="text-warning text-right">{t('lists.statistics.missing')}</th>
                <th className="text-base-content/50 text-right">{t('lists.statistics.notProcessed')}</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.map((stat) => {
                const notProcessed = stat.itemCount - stat.cacheCount
                return (
                  <tr key={stat.fieldId}>
                    <td className="font-medium">{stat.fieldName}</td>
                    <td className="text-right">{stat.itemCount}</td>
                    <td className={twMerge('text-right', stat.valuesCount > 0 && 'text-success')}>
                      {stat.valuesCount}
                    </td>
                    <td className={twMerge('text-right', stat.missingCount > 0 && 'text-warning')}>
                      {stat.missingCount}
                    </td>
                    <td className={twMerge('text-right', notProcessed > 0 && 'text-base-content/50')}>
                      {notProcessed}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing History Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('lists.statistics.processingHistory')}</h2>
        <div className="overflow-x-auto">
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>{t('lists.statistics.fieldName')}</th>
                <th className="text-right">{t('lists.statistics.totalTasks')}</th>
                <th className="text-center">Average duration</th>

                <th className="text-success text-right">{t('lists.statistics.completed')}</th>
                <th className="text-error text-right">{t('lists.statistics.errors')}</th>
                <th className="text-right">{t('lists.statistics.running')}</th>
                <th className="text-right">{t('lists.statistics.queued')}</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.map((stat) => {
                return (
                  <tr key={stat.fieldId}>
                    <td className="font-medium">{stat.fieldName}</td>
                    <td className="text-right">{stat.totalTasksCount}</td>
                    <td className="text-center">{Math.round(stat.averageProcessingDurationSeconds * 10) / 10} sec</td>

                    <td className={twMerge('text-right', stat.completedTasksCount > 0 && 'text-success')}>
                      {stat.completedTasksCount}
                    </td>
                    <td className={twMerge('text-right', stat.errorTasksCount > 0 && 'text-error')}>
                      {stat.errorTasksCount}
                    </td>
                    <td className={twMerge('text-right', stat.processingTasksCount > 0 && 'text-primary')}>
                      {stat.processingTasksCount}
                    </td>
                    <td className={twMerge('text-right', stat.pendingTasksCount > 0 && 'text-info')}>
                      {stat.pendingTasksCount}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
