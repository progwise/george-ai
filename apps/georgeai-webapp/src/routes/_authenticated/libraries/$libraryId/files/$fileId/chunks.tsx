import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { Pagination } from '../../../../../../components/table/pagination'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/chunks')({
  component: RouteComponent,
  validateSearch: z.object({
    skipChunks: z.coerce.number().default(0),
    takeChunks: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { skipChunks, takeChunks } }) => ({
    skipChunks,
    takeChunks,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileChunksQueryOptions({
          fileId: params.fileId,
          skip: deps.skipChunks,
          take: deps.takeChunks,
        }),
      ),
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
    ])
  },
})

function RouteComponent() {
  const { fileId } = Route.useParams()
  const { skipChunks, takeChunks } = Route.useSearch()
  const navigate = Route.useNavigate()
  const {
    data: { aiFileChunks },
  } = useSuspenseQuery(
    getFileChunksQueryOptions({
      fileId,
      skip: skipChunks,
      take: takeChunks,
    }),
  )

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Header Section */}
      <div className="mb-4 flex w-full items-end justify-between">
        <h3 className="text-xl font-bold">
          Chunk {aiFileChunks.skip + 1} - {Math.min(aiFileChunks.skip + aiFileChunks.take, aiFileChunks.count)} of{' '}
          {aiFileChunks.count} Chunks
        </h3>
        <Pagination
          totalItems={aiFileChunks.count}
          itemsPerPage={takeChunks}
          currentPage={1 + aiFileChunks.skip / takeChunks}
          onPageChange={(page) => {
            // TODO: Add prefetching here
            navigate({ search: { skipChunks: (page - 1) * takeChunks, takeChunks } })
          }}
          showPageSizeSelector={true}
          onPageSizeChange={(newPageSize) => {
            navigate({ search: { skipChunks: 0, takeChunks: newPageSize } })
          }}
        />
      </div>

      {/* Chunks Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {aiFileChunks.chunks.map((chunk) => (
          <div key={chunk.id} className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
            <div className="card-body p-3">
              {/* Header with chunk number */}
              <div className="mb-2">
                <div className="badge badge-outline badge-sm badge-primary">#{chunk.chunkIndex + 1}</div>
                {chunk.subChunkIndex > 0 && (
                  <span className="ml-1 badge badge-ghost badge-xs">sub {chunk.subChunkIndex + 1}</span>
                )}
                {chunk.part !== undefined && <span className="ml-1 badge badge-ghost badge-xs">part {chunk.part}</span>}
              </div>

              {/* Path information */}
              <div className="mb-2">
                <div className="truncate text-xs text-base-content/70" title={chunk.headingPath}>
                  {chunk.headingPath}
                </div>
              </div>

              {/* Content preview */}
              <div className="flex-1">
                <div className="max-h-20 overflow-y-auto rounded-sm bg-base-200 p-2">
                  <pre className="text-xs leading-tight text-base-content/90">{chunk.text}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
