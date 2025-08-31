import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { FileCaptionCard } from '../../../../../../components/library/files/file-caption-card'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId }))])
  },
})

function RouteComponent() {
  const params = Route.useParams()

  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId: params.fileId }))

  return (
    <div className="flex flex-col gap-10">
      <FileCaptionCard file={aiLibraryFile} />
      <div role="tabpanel">
        <Outlet />
      </div>
    </div>
  )
}
