import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { getProfileQueryOptions } from '../../../../auth/get-profile-query'
import { EmbeddingsTable } from '../../../../components/library/embeddings-table'
import { aiLibraryFilesQueryOptions } from '../../../../server-functions/library'

const columnSortSchema = z.object({
  page: fallback(z.number(), 1).catch(1),
  column: fallback(z.enum(['index', 'name', 'size', 'chunks', 'processedAt']), 'index').catch('index'),
  direction: fallback(z.enum(['asc', 'desc']), 'asc').catch('asc'),
})

export type ColumnSort = z.infer<typeof columnSortSchema>

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  validateSearch: zodValidator(columnSortSchema),
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
