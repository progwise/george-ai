import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getCrawlerQueryOptions } from '../../../../../../../components/library/crawler/get-crawler'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/runs/')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return Promise.all([context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))])
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))

  if (crawler.lastRun) {
    navigate({
      to: '/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId',
      params: { crawlerRunId: crawler.lastRun.id },
    })
  }
  return <div>Hello "/_authenticated/libraries/$libraryId/crawlers/$crawlerId/runs/"!</div>
}
