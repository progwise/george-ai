import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { LibraryForm } from '../../../../components/library/library-form'
import { getLibraryQueryOptions } from '../../../../components/library/queries/get-library'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/settings')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()

  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  return (
    <div className="grid size-full grid-rows-[auto_1fr] bg-base-100">
      <div className="min-h-0 min-w-0">
        <LibraryForm library={aiLibrary} />
      </div>
    </div>
  )
}
