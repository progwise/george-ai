import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../../auth/get-profile-query'
import { aiLibraryFilesQueryOptions } from '../../../../components/library/files/get-files'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(getProfileQueryOptions())
    context.queryClient.ensureQueryData(aiLibraryFilesQueryOptions({ libraryId: params.libraryId, skip: 0, take: 200 }))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return (
    <div>
      Welcome, {profile?.userId} to the library {libraryId}
    </div>
  )
}
