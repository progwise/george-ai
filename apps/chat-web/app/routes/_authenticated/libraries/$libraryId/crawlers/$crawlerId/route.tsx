import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

import { dateString, timeString } from '@george-ai/web-utils'

import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/get-crawler'
import { getCrawlerRunsQueryOptions } from '../../../../../../components/library/crawler/get-crawler-runs'
import { getCrawlersQueryOptions } from '../../../../../../components/library/crawler/get-crawlers'
import { RunCrawlerButton } from '../../../../../../components/library/crawler/run-crawler-button'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'
import { CheckIcon } from '../../../../../../icons/check-icon'
import WarnIcon from '../../../../../../icons/warn-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))
  },
})

function RouteComponent() {
  const { t, language } = useTranslation()
  const { queryClient } = Route.useRouteContext()
  const params = Route.useParams()
  const search = useSearch({ strict: false })
  const navigate = Route.useNavigate()
  const { libraryId, crawlerId } = Route.useParams()
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions({ libraryId, crawlerId }))

  const invalidateRelatedQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId)),
      queryClient.invalidateQueries(getCrawlerQueryOptions({ libraryId, crawlerId })),
      queryClient.invalidateQueries(
        getCrawlerRunsQueryOptions({
          libraryId,
          crawlerId,
          take: search.takeRuns || 10,
          skip: search.skipRuns || 0,
        }),
      ),
    ])
  }, [queryClient, libraryId, crawlerId, search.takeRuns, search.skipRuns])
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">
          <a href={crawler.url || '#'} target="blank">
            {crawler.url}
          </a>
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <span>
            {t('crawlers.runCount')}: {crawler.runCount}
          </span>
          <span className="mx-2">|</span>
          <span>
            {t('crawlers.lastRun')}:{' '}
            {`${dateString(crawler.lastRun?.startedAt, language)} ${timeString(crawler.lastRun?.startedAt, language)}-${timeString(crawler.lastRun?.endedAt, language)}`}
          </span>
          <span className="mx-2">|</span>
          <span className="">
            {crawler.lastRun?.success && crawler.lastRun.endedAt ? (
              <span className="text-success flex items-center">
                {t('texts.success')}
                <CheckIcon className="inline-block h-4 w-4" />
              </span>
            ) : crawler.lastRun?.endedAt ? (
              <span className="text-error flex items-center">
                <span>{t('texts.failure')}</span>
                <WarnIcon className="inline-block" />
              </span>
            ) : crawler.lastRun ? (
              <span className="text-info flex items-center">
                <span>{t('texts.running')}</span>
                <span className="loading loading-spinner loading-xs"></span>
              </span>
            ) : (
              <span className="text-info flex items-center">
                <span>{t('crawlers.noRunsTitle')}</span>
                <WarnIcon className="inline-block" />
              </span>
            )}
          </span>
          <span className="mx-2">|</span>
          <span>
            {t('texts.files')}: {crawler.filesCount}
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <ul className="menu bg-base-200 menu-horizontal rounded-box items-center gap-2">
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
              to="/libraries/$libraryId/crawlers/$crawlerId"
              params={params}
            >
              Schedule
            </Link>
          </li>

          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: false }}
              to="/libraries/$libraryId/crawlers/$crawlerId/runs"
              params={params}
            >
              Runs
            </Link>
          </li>
          <li>
            <RunCrawlerButton
              crawler={crawler}
              className="btn btn-sm"
              afterStop={async (runId) => {
                if (!runId) return
                await invalidateRelatedQueries()
              }}
              afterStart={async (runId) => {
                if (!runId) return
                await invalidateRelatedQueries()
                // Navigate to the latest run details after starting a crawler
                const newParams = { ...params, crawlerRunId: runId }
                await navigate({
                  to: '/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId',
                  params: newParams,
                })
              }}
            />
          </li>
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
