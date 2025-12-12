import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'

import { getEnrichmentsStatisticsQueryOptions, getListQueryOptions } from '../../../../components/lists/queries'
import { StackedDataQualityBar } from '../../../../components/lists/stacked-data-quality-bar'
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

  // Calculate aggregate data quality metrics
  const aggregateEnriched = statistics.reduce((sum, s) => sum + s.valuesCount, 0)
  const aggregateMissing = statistics.reduce((sum, s) => sum + s.missingCount, 0)
  const aggregateNotProcessed = statistics.reduce((sum, s) => sum + (s.itemCount - s.cacheCount), 0)

  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-2xl font-bold text-base-content/60">{t('lists.statistics.title', { name: aiList.name })}</h1>

      {/* Item Summary */}
      <div className="flex flex-wrap gap-2">
        <div className="badge badge-ghost badge-lg">
          {t('lists.statistics.totalItems')}: {totalItems}
        </div>
        <div className="badge badge-lg">
          {statistics.length} {t('lists.statistics.enrichmentFields')}
        </div>
        {queueTotals.running > 0 && (
          <div className="badge badge-lg badge-primary">
            {queueTotals.running} {t('lists.statistics.running')}
          </div>
        )}

        {queueTotals.pending > 0 && (
          <div className="badge badge-lg badge-secondary">
            {queueTotals.pending} {t('lists.statistics.queued')}
          </div>
        )}
      </div>

      {/* Data Quality Summary Visualization */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-base-content/60">{t('lists.statistics.dataQualitySummary')}</h2>
        <div className="rounded-box bg-base-200 p-4">
          <StackedDataQualityBar
            data={{
              enriched: aggregateEnriched,
              missing: aggregateMissing,
              notProcessed: aggregateNotProcessed,
              total: totalItems * statistics.length,
            }}
            variant="summary"
          />
        </div>
      </div>

      {/* Data Quality Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-base-content/60">{t('lists.statistics.dataQuality')}</h2>
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra">
            <thead>
              <tr>
                <th className="w-48">{t('lists.statistics.fieldName')}</th>
                <th className="w-20 text-center">{t('lists.statistics.items')}</th>
                <th className="w-20 text-center text-success">{t('lists.statistics.enriched')}</th>
                <th className="w-20 text-center text-warning">{t('lists.statistics.missing')}</th>
                <th className="w-28 text-center text-base-content/50">{t('lists.statistics.notProcessed')}</th>
                <th className="text-center">{t('lists.statistics.distribution')}</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.map((stat) => {
                const notProcessed = stat.itemCount - stat.cacheCount
                return (
                  <tr key={stat.fieldId} className="hover:bg-base-300">
                    <td className="w-48 font-medium">{stat.fieldName}</td>
                    <td className="w-20 text-center">{stat.itemCount}</td>
                    <td className={twMerge('w-20 text-center', stat.valuesCount > 0 && 'text-success')}>
                      <div className="flex gap-1">
                        <span className="justify-center font-semibold">{stat.valuesCount}</span>
                        <span className={twMerge('font-light', !stat.valuesCount && 'hidden')}>
                          ({((100 * stat.valuesCount) / stat.itemCount).toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td className={twMerge('w-20 text-center', stat.missingCount > 0 && 'text-warning')}>
                      <div className="flex justify-center gap-1">
                        <span className="font-semibold">{stat.missingCount}</span>
                        <span className={twMerge('font-light', !stat.missingCount && 'hidden')}>
                          ({((100 * stat.missingCount) / stat.itemCount).toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td className={twMerge('w-28 text-center', notProcessed > 0 && 'text-base-content/50')}>
                      <div className="flex justify-center gap-1">
                        <span className="font-semibold">{notProcessed}</span>
                        <span className={twMerge('font-light', !notProcessed && 'hidden')}>
                          ({((100 * notProcessed) / stat.itemCount).toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td>
                      <StackedDataQualityBar
                        data={{
                          enriched: stat.valuesCount,
                          missing: stat.missingCount,
                          notProcessed: notProcessed,
                          total: stat.itemCount,
                        }}
                        variant="compact"
                      />
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
        <h2 className="mb-3 text-lg font-semibold text-base-content/60">{t('lists.statistics.processingHistory')}</h2>
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra">
            <thead>
              <tr>
                <th>{t('lists.statistics.fieldName')}</th>
                <th className="text-center">{t('lists.statistics.totalTasks')}</th>
                <th className="text-center">{t('lists.statistics.averageDuration')}</th>

                <th className="text-center text-success">{t('lists.statistics.completed')}</th>
                <th className="text-center text-error">{t('lists.statistics.errors')}</th>
                <th className="text-center text-primary">{t('lists.statistics.running')}</th>
                <th className="text-center text-secondary">{t('lists.statistics.queued')}</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.map((stat) => {
                return (
                  <tr key={stat.fieldId} className="hover:bg-base-300">
                    <td className="font-medium">{stat.fieldName}</td>
                    <td className="text-center">{stat.totalTasksCount}</td>
                    <td className="text-center">{Math.round(stat.averageProcessingDurationSeconds * 10) / 10} sec</td>

                    <td className={twMerge('text-center', stat.completedTasksCount > 0 && 'text-success')}>
                      {stat.completedTasksCount}
                    </td>
                    <td className={twMerge('text-center', stat.errorTasksCount > 0 && 'text-error')}>
                      {stat.errorTasksCount}
                    </td>
                    <td className={twMerge('text-center', stat.processingTasksCount > 0 && 'text-primary')}>
                      {stat.processingTasksCount}
                    </td>
                    <td className={twMerge('text-center', stat.pendingTasksCount > 0 && 'text-secondary')}>
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
