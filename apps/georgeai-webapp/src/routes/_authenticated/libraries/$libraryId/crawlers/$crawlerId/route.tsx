import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute } from '@tanstack/react-router'

import { dateString, timeString } from '@george-ai/web-utils'

import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/queries/get-crawler'
import { RunCrawlerButton } from '../../../../../../components/library/crawler/run-crawler-button'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'
import { CheckIcon } from '../../../../../../icons/check-icon'
import { WarnIcon } from '../../../../../../icons/warn-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))
  },
})

function RouteComponent() {
  const { t, language } = useTranslation()
  const navigate = Route.useNavigate()

  const { libraryId, crawlerId } = Route.useParams()
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions({ libraryId, crawlerId }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">
          <a href={crawler.uri || '#'} target="blank">
            {crawler.uri}
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
          <span>
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
            <RunCrawlerButton
              crawler={crawler}
              className="btn-sm"
              afterStart={(crawlerRunId) => {
                navigate({
                  to: '/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId',
                  params: { crawlerRunId },
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
