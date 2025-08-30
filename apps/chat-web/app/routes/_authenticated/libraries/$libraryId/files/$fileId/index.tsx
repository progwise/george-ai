import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { FileContent } from '../../../../../../components/library/files/file-content'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId }))])
  },
})

function RouteComponent() {
  const { fileId } = Route.useParams()
  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId }))

  return (
    <>
      <FileContent file={aiLibraryFile} />
    </>
  )
}
