import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { FilesActionsBar } from '../../../../../components/library/files/files-actions-bar'
import { FilesTable } from '../../../../../components/library/files/files-table'
import { getFilesQueryOptions, getLibraryQueryOptions } from '../../../../../components/library/queries'
import { Pagination } from '../../../../../components/table/pagination'
import { useTranslation } from '../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/')({
  component: RouteComponent,
  validateSearch: z.object({
    skip: z.coerce.number().default(0),
    take: z.coerce.number().default(20),
    showArchived: z.coerce.boolean().default(false),
  }),
  loaderDeps: ({ search: { skip, take, showArchived } }) => ({
    skip,
    take,
    showArchived,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFilesQueryOptions({
          libraryId: params.libraryId,
          skip: deps.skip,
          take: deps.take,
          showArchived: deps.showArchived,
        }),
      ),
    ])
  },
})

function RouteComponent() {
  const { skip, take, showArchived } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { libraryId } = Route.useParams()
  const { t } = useTranslation()

  const { data: files } = useSuspenseQuery(getFilesQueryOptions({ libraryId, skip, take, showArchived }))
  const { data: library } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  return (
    <div className="grid size-full grid-rows-[auto_1fr] gap-2 bg-base-100">
      <div>
        <div className="align-text-top text-xs text-nowrap text-primary italic">
          {showArchived
            ? t('files.allFilesForLibrary', { count: files.totalCount })
            : t('files.activeFilesForLibrary', {
                count: files.totalCount,
              })}
        </div>
        <div className="relative flex justify-between align-top">
          <div className="flex flex-row items-center gap-1 overflow-y-auto">
            <h3 className="text-xl font-bold text-nowrap text-base-content">{library.name}</h3>
          </div>
          <div className="absolute right-0 z-49 md:flex">
            <FilesActionsBar
              hasLegacyData={library.manifest?.version !== 1}
              libraryId={libraryId}
              totalItems={files.totalCount}
              showArchived={showArchived}
              archivedCount={files.archivedCount}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col">
          <div className="flex flex-col md:items-end">
            <Pagination
              totalItems={files.totalCount}
              itemsPerPage={take}
              currentPage={1 + skip / take}
              onPageChange={(page) => {
                // TODO: Add prefetching here
                navigate({ search: { skip: (page - 1) * take, take, showArchived } })
              }}
              showPageSizeSelector={true}
              onPageSizeChange={(newPageSize) => {
                navigate({ search: { skip: 0, take: newPageSize, showArchived } })
              }}
            />
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        <FilesTable firstItemNumber={skip + 1} files={files.items} />
      </div>
    </div>
  )
}
