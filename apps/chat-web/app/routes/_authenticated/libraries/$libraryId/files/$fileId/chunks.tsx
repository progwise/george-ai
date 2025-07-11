import { useSuspenseQuery } from '@tanstack/react-query'
import { Router, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { FormattedMarkdown } from '../../../../../../components/formatted-markdown'
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
          libraryId: params.libraryId,
          skip: deps.skipChunks,
          take: deps.takeChunks,
        }),
      ),
      context.queryClient.ensureQueryData(
        getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { fileId, libraryId } = Route.useParams()
  const { skipChunks, takeChunks } = Route.useSearch()
  const navigate = Route.useNavigate()
  const {
    data: { aiFileChunks },
  } = useSuspenseQuery(
    getFileChunksQueryOptions({
      fileId,
      libraryId,
      skip: skipChunks,
      take: takeChunks,
    }),
  )

  return (
    <div>
      <h3 className="mb-4 flex justify-between text-xl font-bold">
        <span>{aiFileChunks.count} Chunks</span>
        <Pagination
          totalItems={aiFileChunks.count}
          itemsPerPage={takeChunks}
          currentPage={1 + aiFileChunks.skip / takeChunks}
          onPageChange={(page) => {
            // TODO: Add prefetching here
            navigate({ search: { skipChunks: (page - 1) * takeChunks, takeChunks } })
          }}
        />
      </h3>
      <div className="flex flex-wrap gap-4">
        {aiFileChunks.chunks.map((chunk) => (
          <div key={chunk.id} className="card card-border bg-base-200 card-xs shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Chunk {chunk.chunkIndex + 1}</h2>
              <p>
                ñ Semantic Path:
                {chunk.headingPath} {chunk.subChunkIndex > 0 ? `(part-${chunk.subChunkIndex + 1})` : ''}
              </p>
              <div>
                <FormattedMarkdown markdown={chunk.text} className="text-xs" />
              </div>
              <hr />
              <div className="card-actions justify-end">Internal Chunk Id: {chunk.id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
