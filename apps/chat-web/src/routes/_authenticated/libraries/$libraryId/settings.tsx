import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getLibraryQueryOptions } from '../../../../components/library/get-library'
import { LibraryForm } from '../../../../components/library/library-form'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/settings')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()

  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  return <LibraryForm library={aiLibrary} />
}
