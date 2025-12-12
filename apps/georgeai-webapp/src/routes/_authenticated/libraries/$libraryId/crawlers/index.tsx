import { useQuery, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { CrawlerRunsTable } from '../../../../../components/library/crawler/crawler-runs-table'
import { CrawlersMenu } from '../../../../../components/library/crawler/crawlers-menu'
import { getCrawlerQueryOptions } from '../../../../../components/library/crawler/queries/get-crawler'
import { getCrawlerRunsQueryOptions } from '../../../../../components/library/crawler/queries/get-crawler-runs'
import { getCrawlersQueryOptions } from '../../../../../components/library/crawler/queries/get-crawlers'
import { Pagination } from '../../../../../components/table/pagination'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
    crawlerId: z.coerce.string().optional(),
  }),
  loaderDeps: ({ search: { skip, take, crawlerId } }) => ({
    skip,
    take,
    crawlerId,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getCrawlersQueryOptions({ libraryId: params.libraryId })),
      deps.crawlerId &&
        context.queryClient.ensureQueryData(
          getCrawlerQueryOptions({ libraryId: params.libraryId, crawlerId: deps.crawlerId }),
        ),
      context.queryClient.ensureQueryData(
        getCrawlerRunsQueryOptions({
          libraryId: params.libraryId,
          crawlerId: deps.crawlerId,
          skip: deps.skip,
          take: deps.take,
        }),
      ),
    ])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { skip, take, crawlerId } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [crawlersQuery, crawlerRunsQuery] = useSuspenseQueries({
    queries: [getCrawlersQueryOptions({ libraryId }), getCrawlerRunsQueryOptions({ libraryId, crawlerId, skip, take })],
  })
  const { data: selectedCrawlerData } = useQuery({
    ...getCrawlerQueryOptions({ libraryId, crawlerId: crawlerId! }),
    enabled: !!crawlerId,
  })

  const crawlers = crawlersQuery.data.aiLibrary.crawlers
  const crawlerRuns = crawlerRunsQuery.data

  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      <div className="flex flex-col gap-2">
        <div>
          <CrawlersMenu
            selectedCrawler={selectedCrawlerData?.aiLibraryCrawler}
            crawlers={crawlers}
            libraryId={libraryId}
          />
        </div>
        <div>
          <Pagination
            className="justify-end"
            totalItems={crawlerRuns.count}
            itemsPerPage={take}
            currentPage={1 + skip / take}
            showPageSizeSelector={true}
            onPageChange={(page) => {
              navigate({
                search: { skip: (page - 1) * take, take },
              })
            }}
            onPageSizeChange={(newPageSize) => {
              navigate({
                search: { take: newPageSize, skip: 0 },
              })
            }}
          />
        </div>
      </div>
      <div className="min-h-0 min-w-0">
        <CrawlerRunsTable crawlerRuns={crawlerRuns.runs} />
      </div>
    </div>
  )
}
