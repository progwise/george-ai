import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { duration } from '@george-ai/web-utils'

import { ClientDate } from '../../../../../../../components/client-date'
import { getCrawlerQueryOptions } from '../../../../../../../components/library/crawler/queries/get-crawler'
import { getCrawlerRunsQueryOptions } from '../../../../../../../components/library/crawler/queries/get-crawler-runs'
import { Pagination } from '../../../../../../../components/table/pagination'
import { useTranslation } from '../../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/runs')({
  component: RouteComponent,
  validateSearch: z.object({
    skipRuns: z.coerce.number().default(0),
    takeRuns: z.coerce.number().default(10),
  }),
  loaderDeps: ({ search: { skipRuns, takeRuns } }) => ({
    skip: skipRuns,
    take: takeRuns,
  }),
  loader: async ({ context, params, deps }) => {
    return await Promise.all([
      context.queryClient.ensureQueryData(getCrawlerRunsQueryOptions({ ...params, skip: deps.skip, take: deps.take })),
      context.queryClient.ensureQueryData(getCrawlerQueryOptions(params)),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const search = Route.useSearch()
  const {
    data: { runs: crawlerRuns },
  } = useSuspenseQuery(getCrawlerRunsQueryOptions({ ...params, ...{ skip: search.skipRuns, take: search.takeRuns } }))
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))
  return (
    <div className="drawer grow gap-4 lg:drawer-open">
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Outlet />
      </div>

      <div className="drawer-side max-lg:z-50">
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="flex flex-col items-center gap-2 bg-base-200 pt-4">
          <div className="flex flex-1 flex-col gap-4 overflow-scroll">
            <Pagination
              totalItems={crawler.runCount}
              itemsPerPage={search.takeRuns}
              currentPage={Math.floor(search.skipRuns / search.takeRuns) + 1}
              onPageChange={(page) => {
                navigate({
                  search: { ...search, skipRuns: (page - 1) * search.takeRuns, takeRuns: search.takeRuns },
                })
              }}
              showPageSizeSelector={true}
              onPageSizeChange={(newPageSize) => {
                navigate({
                  search: { ...search, skipRuns: 0, takeRuns: newPageSize },
                })
              }}
            />
          </div>
          <ul className="menu rounded-box bg-base-200">
            {crawlerRuns.length < 1 ? (
              <li className="text-center text-sm text-gray-500">{t('crawlers.noRunsFound')}</li>
            ) : (
              crawlerRuns.map((run) => (
                <li key={run.id}>
                  <div className="flex flex-col items-start gap-1">
                    <Link
                      to="/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId"
                      params={{ ...params, crawlerRunId: run.id }}
                      className="btn size-full btn-ghost"
                      activeProps={{ className: 'btn-active' }}
                      activeOptions={{ exact: false }}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <h3 className="font-bold">
                          <ClientDate date={run.startedAt} format="dateTime" />
                        </h3>
                        <p className="self-end text-xs font-normal">{`${t('crawlers.runDuration')} : ${duration(run.startedAt, run.endedAt)}`}</p>
                        <p className="self-end text-xs font-normal">
                          {t('crawlers.runStatus')}:{' '}
                          {run.success ? t('texts.success') : !run.endedAt ? t('texts.running') : t('texts.failure')}
                        </p>
                      </div>
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
