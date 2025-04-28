import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../../auth/get-profile-query'
import { EmbeddingsTable, aiLibraryFilesQueryOptions } from '../../../../components/library/embeddings-table'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(getProfileQueryOptions(context.user.id))
    context.queryClient.ensureQueryData(aiLibraryFilesQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions(user.id))

  return <EmbeddingsTable libraryId={libraryId} userId={user.id} profile={profile ?? undefined} />
}
