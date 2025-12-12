import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'
import { LibraryQueryInput } from '../../../../components/library/query/library-query-input'
import { LibraryQueryResult } from '../../../../components/library/query/library-query-result'
import { getQueryLibraryFilesQueryOptions } from '../../../../components/library/query/query-files'
import { Pagination } from '../../../../components/table/pagination'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/query')({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional(),
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { query, skip, take } }) => ({
    query,
    skip,
    take,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId)),
      context.queryClient.ensureQueryData(
        getQueryLibraryFilesQueryOptions({
          libraryId: params.libraryId,
          query: deps.query ?? '*',
          skip: deps.skip,
          take: deps.take,
        }),
      ),
    ])
  },
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { libraryId } = Route.useParams()
  const { query, skip, take } = Route.useSearch()
  const { data: library } = useSuspenseQuery(getLibraryQueryOptions(libraryId))
  const {
    data: { queryAiLibraryFiles: hits },
  } = useSuspenseQuery(
    getQueryLibraryFilesQueryOptions({
      libraryId,
      query: query ?? '*',
      skip,
      take,
    }),
  )
  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      <div>
        <LibraryQueryInput
          defaultSearchTerm={query ?? ''}
          libraryName={library.name}
          onSearchTermChange={(newTerm) => {
            navigate({
              search: { query: newTerm, skip: 0, take },
            })
          }}
        />
        <Pagination
          className="justify-end"
          totalItems={hits.hitCount}
          itemsPerPage={take}
          currentPage={skip / take + 1}
          onPageChange={(page: number) => {
            navigate({
              search: { query, skip: (page - 1) * take, take },
            })
          }}
          showPageSizeSelector={true}
          onPageSizeChange={(newPageSize) => {
            navigate({
              search: { query, skip: 0, take: newPageSize },
            })
          }}
        />
      </div>
      <div className="overflow-auto">
        <LibraryQueryResult
          libraryId={libraryId}
          hits={hits.hits}
          offset={skip}
          searchTerm={query ?? '*'}
          hitCount={hits.hitCount}
        />
      </div>
    </div>
  )
}
