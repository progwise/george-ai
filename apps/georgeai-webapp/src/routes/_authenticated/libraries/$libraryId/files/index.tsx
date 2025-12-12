import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { FilesActionsBar } from '../../../../../components/library/files/files-actions-bar'
import { FilesTable } from '../../../../../components/library/files/files-table'
import { aiLibraryFilesQueryOptions } from '../../../../../components/library/files/get-files'
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
        aiLibraryFilesQueryOptions({
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

  const aiLibraryFilesQuery = useSuspenseQuery(aiLibraryFilesQueryOptions({ libraryId, skip, take, showArchived }))
  const aiLibraryFiles = aiLibraryFilesQuery.data.aiLibraryFiles
  const archivedCount = aiLibraryFiles.archivedCount

  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      <div>
        <div className="align-text-top text-xs text-nowrap text-primary italic">
          {showArchived
            ? t('files.allFilesForLibrary', { count: aiLibraryFiles.count })
            : t('files.activeFilesForLibrary', {
                count: aiLibraryFiles.count,
              })}
        </div>
        <div className="relative flex justify-between align-top">
          <div className="flex flex-col gap-1 overflow-y-auto">
            <h3 className="text-xl font-bold text-nowrap text-base-content">{aiLibraryFiles.library.name}</h3>
          </div>
          <div className="absolute right-0 z-49 md:flex">
            <FilesActionsBar
              libraryId={libraryId}
              totalItems={aiLibraryFiles.count}
              showArchived={showArchived}
              archivedCount={archivedCount}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col">
          <div className="flex flex-col md:items-end">
            <Pagination
              totalItems={aiLibraryFiles.count}
              itemsPerPage={take}
              currentPage={1 + aiLibraryFiles.skip / take}
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
        <FilesTable firstItemNumber={skip + 1} files={aiLibraryFiles.files} />
      </div>
    </div>
  )
}
