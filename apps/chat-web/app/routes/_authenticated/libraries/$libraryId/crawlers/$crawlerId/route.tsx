import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { dateString, dateTimeString, timeString } from '@george-ai/web-utils'

import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/get-crawler'
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
  const params = Route.useParams()
  const { libraryId, crawlerId } = Route.useParams()
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions({ libraryId, crawlerId }))

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
            {t('texts.crawlerRunCount')}: {crawler.runCount}
          </span>
          <span className="mx-2">|</span>
          <span>
            {t('texts.crawlerLastRun')}:{' '}
            {`${dateString(crawler.lastRun?.startedAt, language)} ${timeString(crawler.lastRun?.startedAt, language)}-${timeString(crawler.lastRun?.endedAt, language)}`}
          </span>
          <span className="mx-2">|</span>
          <span className="">
            {crawler.lastRun?.success ? (
              <span className="text-success flex items-center">
                {t('texts.success')}
                <CheckIcon className="inline-block h-4 w-4" />
              </span>
            ) : (
              <span className="text-error flex items-center">
                <span>{t('texts.error')}</span>
                <WarnIcon className="inline-block" />
              </span>
            )}
          </span>
          <span className="mx-2">|</span>
          <span>
            {t('texts.crawledFiles')}: {crawler.filesCount}
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
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
              to="/libraries/$libraryId/crawlers/$crawlerId/files"
              params={params}
            >
              Files
            </Link>
          </li>
          <li>
            <RunCrawlerButton libraryId={libraryId} crawler={crawler} className="btn btn-sm" />
          </li>
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
