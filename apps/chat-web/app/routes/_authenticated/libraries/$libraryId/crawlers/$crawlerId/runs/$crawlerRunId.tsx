import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { getCrawlerRunQueryOptions } from '../../../../../../../components/library/crawler/get-crawler-run'
import { Pagination } from '../../../../../../../components/table/pagination'

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
  const navigate = Route.useNavigate()
  const params = Route.useParams()
  const search = Route.useSearch()
  const {
    data: { aiLibraryCrawlerRun: crawlerRun },
  } = useSuspenseQuery(getCrawlerRunQueryOptions({ ...params, ...search }))
  return (
    <div>
      <h2 className="text-2xl font-bold">Crawler Run Details</h2>
      <Pagination
        totalItems={crawlerRun.updatesCount}
        itemsPerPage={search.takeUpdates}
        currentPage={1 + search.skipUpdates / search.takeUpdates}
        onPageChange={(page) => {
          console.log('Page changed to:', page)
          navigate({
            search: { ...search, skipUpdates: (page - 1) * search.takeUpdates, takeUpdates: search.takeUpdates },
          })
        }}
      />
      <pre>{JSON.stringify(crawlerRun, null, 2)}</pre>
      {/* Additional components to display crawler run details can be added here */}
    </div>
  )
}
