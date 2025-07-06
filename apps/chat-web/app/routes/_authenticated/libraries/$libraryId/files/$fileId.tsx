import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { FileContent } from '../../../../../components/library/files/file-content'
import { getFileContentQueryOptions } from '../../../../../components/library/files/get-file-content'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileContentQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { libraryId, fileId } = Route.useParams()
  const { data: fileContent } = useSuspenseQuery(getFileContentQueryOptions({ fileId, libraryId }))
  return (
    <div>
      Hello "/_authenticated/libraries/$libraryId/files/$fileId"!
      {fileContent ? <FileContent markdown={fileContent} /> : <p>No content available</p>}
    </div>
  )
}
