import { createFileRoute } from '@tanstack/react-router'

import { LibraryQuery } from '../../../../components/library/library-query'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/query')({
  component: RouteComponent,
})

function RouteComponent() {
  const { libraryId } = Route.useParams()

  return <LibraryQuery libraryId={libraryId} />
}
