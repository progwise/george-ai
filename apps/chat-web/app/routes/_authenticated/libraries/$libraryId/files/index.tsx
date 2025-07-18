import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

import { getProfileQueryOptions } from '../../../../../auth/get-profile-query'
import { FilesActionsBar } from '../../../../../components/library/files/files-actions-bar'
import { FilesTable } from '../../../../../components/library/files/files-table'
import { aiLibraryFilesQueryOptions, getUnprocessedFileCount } from '../../../../../components/library/files/get-files'
import { Pagination } from '../../../../../components/table/pagination'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/')({
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
      context.queryClient.ensureQueryData(getProfileQueryOptions()),
      context.queryClient.ensureQueryData(
        aiLibraryFilesQueryOptions({ libraryId: params.libraryId, skip: deps.skip, take: deps.take }),
      ),
    ])
  },
})

function RouteComponent() {
  const { skip, take } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { libraryId } = Route.useParams()
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())
  const { queryClient } = Route.useRouteContext()

  const {
    data: { aiLibraryFiles },
  } = useSuspenseQuery(aiLibraryFilesQueryOptions({ libraryId, skip, take }))

  const { data } = useSuspenseQuery(getUnprocessedFileCount({ libraryId }))
  const unprocessedFileCount = data?.unprocessedFileCount ?? 0

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  return (
    <div>
      <h1 className="mb-2 flex justify-between text-xl font-bold">
        {aiLibraryFiles.count} Files for library {aiLibraryFiles.library.name}
        <Pagination
          totalItems={aiLibraryFiles.count}
          itemsPerPage={take}
          currentPage={1 + aiLibraryFiles.skip / take}
          onPageChange={(page) => {
            // TODO: Add prefetching here
            navigate({ search: { skip: (page - 1) * take, take } })
          }}
        />
      </h1>
      <FilesActionsBar
        libraryId={libraryId}
        availableStorage={profile?.freeStorage || 0}
        usedStorage={profile?.usedStorage || 0}
        checkedFileIds={selectedFileIds}
        setCheckedFileIds={setSelectedFileIds}
        tableDataChanged={() => {
          queryClient.invalidateQueries({
            queryKey: aiLibraryFilesQueryOptions({ libraryId, skip, take }).queryKey,
          })
          queryClient.invalidateQueries({
            queryKey: getUnprocessedFileCount({ libraryId }).queryKey,
          })
        }}
        totalItems={aiLibraryFiles.count}
        unprocessedFileCount={unprocessedFileCount ?? 0}
      />
      <FilesTable
        firstItemNumber={skip + 1}
        files={aiLibraryFiles.files}
        selectedFileIds={selectedFileIds}
        setSelectedFileIds={setSelectedFileIds}
        tableDataChanged={() => {
          queryClient.invalidateQueries({ queryKey: aiLibraryFilesQueryOptions({ libraryId, skip, take }).queryKey })
        }}
      />
    </div>
  )
}
