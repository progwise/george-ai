import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { dateTimeString, duration } from '@george-ai/web-utils'

import { getCrawlerRunQueryOptions } from '../../../../../../../components/library/crawler/get-crawler-run'
import { Pagination } from '../../../../../../../components/table/pagination'
import { useTranslation } from '../../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId')({
  component: RouteComponent,
  validateSearch: z.object({
    skipUpdates: z.coerce.number().default(0),
    takeUpdates: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { skipUpdates, takeUpdates } }) => ({
    skipUpdates,
    takeUpdates,
  }),
  loader: async ({ context, params, deps }) => {
    return await Promise.all([context.queryClient.ensureQueryData(getCrawlerRunQueryOptions({ ...params, ...deps }))])
  },
})

function RouteComponent() {
  const intervalId = useRef(null as ReturnType<typeof setInterval> | null)
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const search = Route.useSearch()
  const { queryClient } = Route.useRouteContext()
  const { t, language } = useTranslation()
  const {
    data: { aiLibraryCrawlerRun: crawlerRun },
  } = useSuspenseQuery(getCrawlerRunQueryOptions({ ...params, ...search }))

  useEffect(() => {
    if (crawlerRun.endedAt && !intervalId.current) {
      return
    }
    if (crawlerRun.endedAt && intervalId.current) {
      clearInterval(intervalId.current)
      intervalId.current = null
      return
    }
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }
    intervalId.current = setInterval(async () => {
      queryClient.invalidateQueries({
        queryKey: ['getCrawlerRun', { libraryId: params.libraryId, crawlerRunId: params.crawlerRunId }],
      })
      queryClient.invalidateQueries({
        queryKey: ['getCrawler', { libraryId: params.libraryId, crawlerId: params.crawlerId }],
      })
      queryClient.invalidateQueries({
        queryKey: ['getCrawlerRuns', { libraryId: params.libraryId, crawlerId: params.crawlerId }],
      })
    }, 2000)
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
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
          {crawlerRun.updates && crawlerRun.updates.length > 0 ? (
            <>
              {/* Pagination at top - only shown when there are updates */}
              <Pagination
                totalItems={crawlerRun.updatesCount}
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
              />

              <div className="overflow-x-auto">
                <table className="table-zebra table w-full table-fixed">
                  <colgroup>
                    <col className="w-48" />
                    <col className="w-24" />
                    <col className="w-72" />
                    <col className="w-auto" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{t('updates.date')}</th>
                      <th>{t('updates.success')}</th>
                      <th>{t('updates.file')}</th>
                      <th>{t('updates.message')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crawlerRun.updates.map((update) => (
                      <tr key={update.id}>
                        <td className="truncate">{dateTimeString(update.createdAt, language)}</td>
                        <td>
                          <span className={`badge ${update.success ? 'badge-success' : 'badge-error'}`}>
                            {update.success ? t('updates.success') : t('updates.failed')}
                          </span>
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
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="break-words">{update.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-base-content/60 py-8 text-center">{t('crawlers.noUpdatesFound')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
