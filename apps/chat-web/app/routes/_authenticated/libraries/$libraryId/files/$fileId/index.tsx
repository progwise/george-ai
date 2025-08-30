import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { FileContent } from '../../../../../../components/library/files/file-content'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { getFileSourcesQueryOptions } from '../../../../../../components/library/files/get-file-sources'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
      context.queryClient.ensureQueryData(
        getFileSourcesQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { libraryId, fileId } = Route.useParams()
  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId }))
  const { data: fileSources } = useSuspenseQuery(getFileSourcesQueryOptions({ fileId, libraryId }))

  return (
    <>
      <FileContent sources={fileSources} file={aiLibraryFile} />
    </>
  )
}
