import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../../auth/get-profile-query'
import { EmbeddingsTable } from '../../../../components/library/embeddings-table'
import { aiLibraryFilesQueryOptions } from '../../../../server-functions/library'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(getProfileQueryOptions())
    context.queryClient.ensureQueryData(aiLibraryFilesQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return <EmbeddingsTable libraryId={libraryId} profile={profile ?? undefined} />
}
