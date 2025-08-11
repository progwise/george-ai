import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getCrawlersQueryOptions } from '../../../../components/library/crawler/get-crawlers'
import {
  UpdatesActionBar,
  UpdatesTable,
  getLibraryUpdateItemsQueryOptions,
} from '../../../../components/library/updates'
import { Pagination } from '../../../../components/table/pagination'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/updates')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { skip, take } }) => ({
    skip,
    take,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getLibraryUpdateItemsQueryOptions({ libraryId: params.libraryId, skip: deps.skip, take: deps.take }),
      ),
      context.queryClient.ensureQueryData(getCrawlersQueryOptions(params.libraryId)),
    ])
  },
})

function RouteComponent() {
  const { skip, take } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { libraryId } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const {
    data: { aiLibraryUpdates },
  } = useSuspenseQuery(getLibraryUpdateItemsQueryOptions({ libraryId, skip, take }))
  return (
    <div>
      <h1 className="mb-2 flex justify-between font-bold md:text-xl">
        {aiLibraryUpdates.count} Updates
        <Pagination
          totalItems={aiLibraryUpdates.count}
          itemsPerPage={take}
          currentPage={1 + aiLibraryUpdates.skip / take}
          onPageChange={(page) => {
            // TODO: Add prefetching here
            navigate({ search: { skip: (page - 1) * take, take } })
          }}
        />
      </h1>
      <UpdatesActionBar
        libraryId={libraryId}
        tableDataChanged={() => {
          queryClient.invalidateQueries({
            queryKey: getLibraryUpdateItemsQueryOptions({ libraryId, skip, take }).queryKey,
          })
        }}
        totalItems={aiLibraryUpdates.count}
      />
      <UpdatesTable firstItemNumber={skip + 1} updates={aiLibraryUpdates.updates} />
    </div>
  )
}
