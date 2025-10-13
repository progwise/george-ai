import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/queries/get-crawler'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))
  },
})

function RouteComponent() {
  const params = Route.useParams()

  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))

  return <div>Crawler overview for {crawler.uri} with statistics, runs, etc coming soon!</div>
}
