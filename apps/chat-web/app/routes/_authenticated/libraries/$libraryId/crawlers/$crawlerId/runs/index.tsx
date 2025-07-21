import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getCrawlerQueryOptions } from '../../../../../../../components/library/crawler/get-crawler'
import { RunCrawlerButton } from '../../../../../../../components/library/crawler/run-crawler-button'
import { useTranslation } from '../../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/runs/')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return Promise.all([context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))

  useEffect(() => {
    if (crawler.lastRun) {
      navigate({
        to: '/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId',
        params: { crawlerRunId: crawler.lastRun.id },
      })
    }
  }, [crawler.lastRun, navigate, params])
  return (
    <div className="card bg-base-100 w-96 shadow-sm">
      <figure>
        <img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{t('crawlers.noRunsTitle')}</h2>
        <p>{t('crawlers.noRunsDescription')}</p>
        <div className="card-actions justify-end">
          <RunCrawlerButton
            className="btn btn-primary"
            crawler={crawler}
            afterStart={(crawlerRunId) => {
              navigate({
                to: '/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId',
                params: { crawlerRunId },
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
