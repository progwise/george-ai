import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { getProfileQueryOptions } from '../../../../auth/get-profile-query'
import { EmbeddingsTable } from '../../../../components/library/embeddings-table'
import { aiLibraryFilesQueryOptions } from '../../../../server-functions/library'

const columnSortSchema = z.object({
  page: fallback(z.number(), 1),
  column: fallback(z.enum(['index', 'name', 'size', 'chunks', 'processedAt']), 'index'),
  direction: fallback(z.enum(['asc', 'desc']), 'asc'),
  itemsPerPage: fallback(z.number(), 5),
})

export type ColumnSort = z.infer<typeof columnSortSchema>

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  validateSearch: zodValidator(columnSortSchema),
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(getProfileQueryOptions())
    context.queryClient.invalidateQueries(aiLibraryFilesQueryOptions(params.libraryId, 'index', 'asc', 1, 5))
  },
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return <EmbeddingsTable libraryId={libraryId} profile={profile ?? undefined} />
}
