import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { toastSuccess } from '../../../../../../components/georgeToaster'
import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { Pagination } from '../../../../../../components/table/pagination'
import { CopyIcon } from '../../../../../../icons/copy-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/chunks')({
  component: RouteComponent,
  validateSearch: z.object({
    skipChunks: z.coerce.number().default(0),
    takeChunks: z.coerce.number().default(20),
    part: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { skipChunks, takeChunks, part } }) => ({
    skipChunks,
    takeChunks,
    part,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileChunksQueryOptions({
          fileId: params.fileId,
          skip: deps.skipChunks,
          take: deps.takeChunks,
          part: deps.part,
        }),
      ),
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
    ])
  },
})

function RouteComponent() {
  const { fileId } = Route.useParams()
  const { skipChunks, takeChunks, part } = Route.useSearch()
  const navigate = Route.useNavigate()
  const {
    data: { aiFileChunks },
  } = useSuspenseQuery(
    getFileChunksQueryOptions({
      fileId,
      skip: skipChunks,
      take: takeChunks,
      part,
    }),
  )

  const handleCopyChunk = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toastSuccess('Copied to clipboard')
  }

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Header Section */}
      <div className="mb-4 flex w-full items-end justify-between gap-4">
        <h3 className="text-xl font-bold">
          Chunk {aiFileChunks.skip + 1} - {Math.min(aiFileChunks.skip + aiFileChunks.take, aiFileChunks.count)} of{' '}
          {aiFileChunks.count} Chunks
          {part !== undefined && <span className="ml-2 badge badge-primary">Part {part}</span>}
        </h3>

        <div className="flex items-end gap-2">
          <label className="input input-xs w-24">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              required
              placeholder="Part#"
              value={part ?? ''}
              onChange={(e) => {
                const value = e.target.value
                navigate({
                  search: {
                    skipChunks: 0,
                    takeChunks,
                    part: value ? parseInt(value, 10) : undefined,
                  },
                })
              }}
            />
          </label>
          <Pagination
            totalItems={aiFileChunks.count}
            itemsPerPage={takeChunks}
            currentPage={1 + aiFileChunks.skip / takeChunks}
            onPageChange={(page) => {
              // TODO: Add prefetching here
              navigate({ search: { skipChunks: (page - 1) * takeChunks, takeChunks, part } })
            }}
            showPageSizeSelector={true}
            onPageSizeChange={(newPageSize) => {
              navigate({ search: { skipChunks: 0, takeChunks: newPageSize, part } })
            }}
          />
        </div>
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
                {chunk.part && <span className="ml-1 badge badge-ghost badge-xs">part {chunk.part}</span>}
              </div>

              {/* Path information */}
              <div className="mb-2">
                <div className="truncate text-xs text-base-content/70" title={chunk.headingPath}>
                  {chunk.headingPath}
                </div>
              </div>

              {/* Content preview */}
              <div className="flex-1">
                <div className="relative max-h-20 overflow-y-auto rounded-sm bg-base-200 p-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs absolute right-1 top-1 opacity-50 hover:opacity-100"
                    onClick={() => handleCopyChunk(chunk.text)}
                    title="Copy to clipboard"
                  >
                    <CopyIcon className="size-3" />
                  </button>
                  <pre className="text-xs leading-tight text-base-content/90">{chunk.text}</pre>
                </div>
              </div>

              {/* Footer with debug info */}
              <div className="mt-2 border-t border-base-300 pt-2">
                <div className="font-mono text-[10px] text-base-content/40">ID: {chunk.id}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
