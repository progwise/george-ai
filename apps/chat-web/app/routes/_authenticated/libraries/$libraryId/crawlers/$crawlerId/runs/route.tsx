import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { dateTimeString, duration } from '@george-ai/web-utils'

import { getCrawlerQueryOptions } from '../../../../../../../components/library/crawler/get-crawler'
import { getCrawlerRunsQueryOptions } from '../../../../../../../components/library/crawler/get-crawler-runs'
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
  const { t, language } = useTranslation()
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const search = Route.useSearch()
  const {
    data: {
      aiLibraryCrawler: { runs: crawlerRuns },
    },
  } = useSuspenseQuery(getCrawlerRunsQueryOptions({ ...params, ...{ skip: search.skipRuns, take: search.takeRuns } }))
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))
  return (
    <div
      className={twMerge(
        'drawer lg:drawer-open grow gap-4',
        // 'min-h-[calc(100dvh_-_--spacing(0))]', // full height minus the top bar
      )}
    >
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Outlet />
      </div>

      <div
        className={twMerge(
          'drawer-side max-lg:z-50',
          //'lg:h-[calc(100dvh_-_--spacing(100))]', // full height minus the top bar
        )}
      >
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="bg-base-200 flex flex-col items-center gap-2 pt-4">
          <div className="flex flex-1 flex-col gap-4 overflow-scroll">
            <Pagination
              totalItems={crawler.runCount}
              itemsPerPage={search.takeRuns}
              currentPage={Math.floor(search.skipRuns / search.takeRuns) + 1}
              onPageChange={(page) => {
                console.log('Page changed to:', page)
                navigate({
                  search: { ...search, skipRuns: (page - 1) * search.takeRuns, takeRuns: search.takeRuns },
                })
              }}
            />
          </div>
          <ul className="menu bg-base-200 rounded-box">
            {crawlerRuns.length < 1 ? (
              <li className="text-center text-sm text-gray-500">{'No runs found.'}</li>
            ) : (
              crawlerRuns.map((run) => (
                <li key={run.id} className="">
                  <div className="flex flex-col items-start gap-1">
                    <Link
                      to="/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId"
                      params={{ ...params, crawlerRunId: run.id }}
                      className="btn btn-btn-ghost h-full w-full"
                      activeProps={{ className: 'btn-active' }}
                      activeOptions={{ exact: false }}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <h3 className="font-bold">{dateTimeString(run.startedAt, language)}</h3>
                        <p className="self-end text-xs font-normal">Duration: {duration(run.startedAt, run.endedAt)}</p>
                        <p className="self-end text-xs font-normal">
                          Status: {run.success ? 'Success' : !run.endedAt ? t('texts.running') : t('texts.failure')}
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
