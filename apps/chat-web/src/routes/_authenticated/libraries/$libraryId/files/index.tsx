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
    <div>
      <h1 className="mb-2 flex justify-between text-xl font-bold">
        {showArchived
          ? t('files.allFilesForLibrary', { count: aiLibraryFiles.count, libraryName: aiLibraryFiles.library.name })
          : t('files.activeFilesForLibrary', { count: aiLibraryFiles.count, libraryName: aiLibraryFiles.library.name })}
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
      </h1>
      <FilesActionsBar
        libraryId={libraryId}
        totalItems={aiLibraryFiles.count}
        showArchived={showArchived}
        archivedCount={archivedCount}
      />
      <FilesTable firstItemNumber={skip + 1} files={aiLibraryFiles.files} />
    </div>
  )
}
