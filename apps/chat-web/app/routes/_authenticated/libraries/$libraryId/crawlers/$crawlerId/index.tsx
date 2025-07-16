import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { CrawlerForm } from '../../../../../../components/library/crawler/crawler-form'
import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/get-crawler'
import { getCrawlersQueryOptions } from '../../../../../../components/library/crawler/get-crawlers'
import { updateCrawlerFunction } from '../../../../../../components/library/crawler/update-crawler'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const { queryClient } = Route.useRouteContext()

  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))
  const { mutate: updateCrawlerMutation, isPending } = useMutation({
    mutationFn: updateCrawlerFunction,
    onSuccess: async () => {
      await queryClient.invalidateQueries(getCrawlersQueryOptions(params.libraryId))
    },
  })

  const handleSubmit = (formData: FormData) => {
    updateCrawlerMutation({ data: formData })
  }
  return (
    <div>
      <CrawlerForm initialData={crawler} isPending={isPending} />

      <pre>{JSON.stringify(crawler, null, 2)}</pre>
    </div>
  )
}
