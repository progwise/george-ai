import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../../auth/get-profile-query'
import { getLibraryQueryOptions } from '../../../../components/library/get-library'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getProfileQueryOptions()),
      context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId)),
    ])
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())
  const { data: library } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  return (
    <div>
      Welcome, {profile?.email} to the library {library.name} (ID: {libraryId})!
    </div>
  )
}
