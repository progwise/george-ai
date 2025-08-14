import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { dateTimeString, dateTimeStringArray, duration } from '@george-ai/web-utils'

import { getCrawlerRunQueryOptions } from '../../../../../../../components/library/crawler/get-crawler-run'
import { UpdateStatusBadge } from '../../../../../../../components/library/crawler/update-status-badge'
import { Pagination } from '../../../../../../../components/table/pagination'
import { useTranslation } from '../../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId')({
  component: RouteComponent,
  validateSearch: z.object({
    skipUpdates: z.coerce.number().default(0),
    takeUpdates: z.coerce.number().default(20),
    updateTypeFilter: z.array(z.string()).optional(),
  }),
  loaderDeps: ({ search: { skipUpdates, takeUpdates, updateTypeFilter } }) => ({
    skipUpdates,
    takeUpdates,
    updateTypeFilter,
  }),
  loader: async ({ context, params, deps }) => {
    return await Promise.all([context.queryClient.ensureQueryData(getCrawlerRunQueryOptions({ ...params, ...deps }))])
  },
})

function RouteComponent() {
  const intervalId = useRef(null as ReturnType<typeof setTimeout> | null)
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const search = Route.useSearch()
  const { queryClient } = Route.useRouteContext()
  const { t, language } = useTranslation()
  const {
    data: { aiLibraryCrawlerRun: crawlerRun },
  } = useSuspenseQuery(
    getCrawlerRunQueryOptions({
      ...params,
      ...search,
    }),
  )

  useEffect(() => {
    if (crawlerRun.endedAt && !intervalId.current) {
      return
    }
    if (crawlerRun.endedAt && intervalId.current) {
      clearTimeout(intervalId.current)
      intervalId.current = null
      return
    }
    if (intervalId.current) {
      clearTimeout(intervalId.current)
    }

    // Exponential backoff implementation
    let currentInterval = 2000 // Start with 2 seconds
    const maxInterval = 30000 // Cap at 30 seconds
    const backoffMultiplier = 1.5 // Increase by 50% each time

    const scheduleNextRefresh = () => {
      intervalId.current = setTimeout(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['getCrawlerRun', { libraryId: params.libraryId, crawlerRunId: params.crawlerRunId }],
        })
        await queryClient.invalidateQueries({
          queryKey: ['getCrawler', { libraryId: params.libraryId, crawlerId: params.crawlerId }],
        })
        await queryClient.invalidateQueries({
          queryKey: ['getCrawlerRuns', { libraryId: params.libraryId, crawlerId: params.crawlerId }],
        })

        // Only continue polling if the crawler hasn't ended
        if (!crawlerRun.endedAt) {
          currentInterval = Math.min(currentInterval * backoffMultiplier, maxInterval)
          scheduleNextRefresh()
        }
      }, currentInterval)
    }

    scheduleNextRefresh()

    return () => {
      if (intervalId.current) {
        clearTimeout(intervalId.current)
        intervalId.current = null
      }
    }
  }, [crawlerRun.endedAt, params, queryClient, search])
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('crawlers.runDetails')}</h2>

      {/* Run Details Card */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">
                <span className="label-text font-medium">{t('crawlers.runStartDate')}</span>
              </label>
              <div className="text-sm">
                {crawlerRun.startedAt ? dateTimeString(crawlerRun.startedAt, language) : 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">{t('crawlers.runEndDate')}</span>
              </label>
              <div className="text-sm">
                {crawlerRun.endedAt ? dateTimeString(crawlerRun.endedAt, language) : t('texts.running')}
              </div>
              {crawlerRun.stoppedByUser && (
                <div className="text-base-content/60 text-sm">
                  {t('crawlers.stoppedByUser')}: {dateTimeString(crawlerRun.stoppedByUser, language)}
                </div>
              )}
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">{t('crawlers.runDuration')}</span>
              </label>
              <div className="text-sm">
                {crawlerRun.startedAt && crawlerRun.endedAt
                  ? duration(crawlerRun.startedAt, crawlerRun.endedAt)
                  : 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">{t('crawlers.runStatus')}</span>
              </label>
              <div className="text-sm">
                <span
                  className={`badge ${crawlerRun.success ? 'badge-success' : !crawlerRun.endedAt ? 'badge-info' : 'badge-error'}`}
                >
                  {crawlerRun.success
                    ? t('crawlers.runSuccess')
                    : !crawlerRun.endedAt
                      ? t('crawlers.runInProgress')
                      : t('crawlers.runFailed')}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {crawlerRun.errorMessage && (
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-medium">Error Message</span>
              </label>
              <div className="bg-base-200 max-h-32 overflow-y-auto whitespace-pre-line rounded p-3 text-sm">
                {crawlerRun.errorMessage.replace(/,/g, ',\n')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Updates Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title">Updates ({crawlerRun.updatesCount})</h3>

          {/* Updates Table */}
          <>
            <div className="flex items-center justify-between">
              {/* Pagination at top - only shown when there are updates */}
              <Pagination
                totalItems={crawlerRun.filteredUpdatesCount}
                itemsPerPage={search.takeUpdates}
                currentPage={1 + search.skipUpdates / search.takeUpdates}
                onPageChange={(page) => {
                  navigate({
                    search: {
                      ...search,
                      skipUpdates: (page - 1) * search.takeUpdates,
                      takeUpdates: search.takeUpdates,
                    },
                  })
                }}
                showPageSizeSelector={true}
                onPageSizeChange={(newPageSize) => {
                  navigate({
                    search: {
                      ...search,
                      skipUpdates: 0,
                      takeUpdates: newPageSize,
                    },
                  })
                }}
              />
              <div className="flex items-end">
                <div className="flex gap-2">
                  {crawlerRun.updateStats &&
                    crawlerRun.updateStats.map((stat) => {
                      if (!stat.count || stat.count === 0) return null

                      return (
                        <UpdateStatusBadge
                          key={stat.updateType || 'error'}
                          updateType={stat.updateType}
                          count={stat.count}
                          size="sm"
                          showCheckmark={true}
                          checked={
                            search.updateTypeFilter
                              ? search.updateTypeFilter.includes(stat.updateType || 'error')
                              : true
                          }
                          onCheckmarkChange={(updateType, checked) => {
                            // Get all available update types from stats
                            const allTypes = crawlerRun.updateStats?.map((s) => s.updateType || 'error') || []
                            const currentFilter = search.updateTypeFilter

                            let newFilter: string[] | undefined

                            if (!currentFilter) {
                              // No filter currently - if unchecking, filter out this type
                              newFilter = checked ? undefined : allTypes.filter((type) => type !== updateType)
                            } else {
                              // Filter exists - add/remove type
                              if (checked) {
                                newFilter = [...currentFilter, updateType].filter(
                                  (type, index, arr) => arr.indexOf(type) === index,
                                )
                                // If all types are selected, remove filter entirely
                                if (newFilter.length === allTypes.length) {
                                  newFilter = undefined
                                }
                              } else {
                                newFilter = currentFilter.filter((type) => type !== updateType)
                                // If no types selected, undefined (show nothing? or show all?)
                                if (newFilter.length === 0) {
                                  newFilter = undefined
                                }
                              }
                            }

                            navigate({
                              search: {
                                ...search,
                                skipUpdates: 0,
                                updateTypeFilter: newFilter,
                              },
                            })
                          }}
                        />
                      )
                    })}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table-zebra table-xs table w-full table-fixed">
                <colgroup>
                  <col className="w-24" />
                  <col className="w-20" />
                  <col className="w-54" />
                  <col className="w-auto" />
                </colgroup>
                <thead>
                  <tr>
                    <th>{t('updates.status')}</th>
                    <th>{t('updates.date')}</th>
                    <th>{t('updates.file')}</th>
                    <th>{t('updates.message')}</th>
                  </tr>
                </thead>
                <tbody>
                  {crawlerRun.updates.map((update) => {
                    // Use updateType field
                    const updateType = update.updateType || 'error'
                    const isOmitted = updateType === 'omitted'
                    const displayFileName = isOmitted ? update.fileName : update.file?.name
                    const displayFilePath = isOmitted ? update.filePath : null

                    return (
                      <tr key={update.id}>
                        <td>
                          <UpdateStatusBadge updateType={updateType} size="xs" />
                        </td>
                        <td className="truncate">
                          {dateTimeStringArray(update.createdAt, language).map((item) => (
                            <div key={item} className="text-nowrap">
                              {item}
                            </div>
                          ))}
                        </td>

                        <td className="truncate">
                          {update.file ? (
                            <Link
                              to="/libraries/$libraryId/files/$fileId"
                              params={{ libraryId: params.libraryId, fileId: update.file.id }}
                              className="link link-primary"
                              title={update.file.name}
                            >
                              {update.file.name}
                            </Link>
                          ) : isOmitted && displayFileName ? (
                            displayFilePath ? (
                              <a
                                href={displayFilePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link text-gray-600"
                                title={displayFilePath}
                              >
                                {displayFileName}
                              </a>
                            ) : (
                              <span title={displayFilePath || undefined} className="text-gray-600">
                                {displayFileName}
                              </span>
                            )
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="break-words text-xs">{update.message || 'no info available'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        </div>
      </div>
    </div>
  )
}
