import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { toastSuccess } from '../../../../../../components/georgeToaster'
import { getDocumentChunksQueryOptions, getDocumentQueryOptions } from '../../../../../../components/library/queries'
import { Pagination } from '../../../../../../components/table/pagination'
import { CopyIcon } from '../../../../../../icons/copy-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/chunks')({
  component: RouteComponent,
  validateSearch: z.object({
    firstChunk: z.coerce.number().default(1),
    takeChunks: z.coerce.number().default(20),
    fragment: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { firstChunk, takeChunks, fragment } }) => ({
    firstChunk,
    takeChunks,
    fragment,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getDocumentChunksQueryOptions({
          libraryId: params.libraryId,
          documentId: params.fileId,
          firstChunk: deps.firstChunk,
          take: deps.takeChunks,
          fragment: deps.fragment,
        }),
      ),
      context.queryClient.ensureQueryData(getDocumentQueryOptions(params)),
    ])
  },
})

function RouteComponent() {
  const { fileId, libraryId } = Route.useParams()
  const { firstChunk, takeChunks, fragment } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: aiFileChunks } = useSuspenseQuery(
    getDocumentChunksQueryOptions({
      libraryId,
      documentId: fileId,
      firstChunk,
      take: takeChunks,
      fragment,
    }),
  )

  const handleCopyChunk = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toastSuccess('Copied to clipboard')
  }

  if (!aiFileChunks || aiFileChunks.totalCount === null || aiFileChunks.totalCount === undefined) {
    return <div className="container mx-auto p-4">No chunks available for this file.</div>
  }

  return (
    <div className="grid size-full grid-rows-[auto_1fr] gap-2 bg-base-100">
      {/* Header Section */}
      <div className="mb-4 flex w-full items-end justify-between gap-4">
        <h3 className="text-xl font-bold">
          Chunk {firstChunk} - {Math.min(firstChunk + takeChunks - 1, aiFileChunks.totalCount)} of{' '}
          {aiFileChunks.totalCount} Chunks
          {fragment !== undefined && <span className="ml-2 badge badge-primary">Fragment {fragment}</span>}
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
              value={fragment ?? ''}
              onChange={(e) => {
                const value = e.target.value
                navigate({
                  search: {
                    firstChunk: 1,
                    takeChunks,
                    fragment: value ? parseInt(value, 10) : undefined,
                  },
                })
              }}
            />
          </label>
          <Pagination
            totalItems={aiFileChunks.totalCount}
            itemsPerPage={takeChunks}
            currentPage={Math.ceil(1 + (firstChunk - 1) / takeChunks)}
            onPageChange={(page) => {
              // TODO: Add prefetching here
              navigate({ search: { firstChunk: 1 + (page - 1) * takeChunks, takeChunks, fragment } })
            }}
            showPageSizeSelector={true}
            onPageSizeChange={(newPageSize) => {
              navigate({ search: { firstChunk: 1, takeChunks: newPageSize, fragment } })
            }}
          />
        </div>
      </div>

      {/* Chunks Grid */}
      <div className="overflow-scroll">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {aiFileChunks.chunks.map((chunk) => (
            <div key={chunk.id} className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
              <div className="card-body p-3">
                {/* Header with chunk number */}
                <div className="mb-2">
                  <div className="badge badge-outline badge-sm badge-primary">#{chunk.chunk}</div>
                  {chunk.fragment && <span className="ml-1 badge badge-ghost badge-xs">part {chunk.fragment}</span>}
                </div>

                {/* Path information */}
                <div className="mb-2">
                  <div className="truncate text-xs text-base-content/70" title={chunk.id}>
                    {chunk.id}
                  </div>
                </div>

                {/* Content preview */}
                <div className="flex-1">
                  <div className="relative max-h-30 overflow-y-auto rounded-sm bg-base-200 p-2">
                    <button
                      type="button"
                      className="btn absolute top-1 right-1 opacity-50 btn-ghost btn-xs hover:opacity-100"
                      onClick={() => handleCopyChunk(chunk.content || '')}
                      title="Copy to clipboard"
                    >
                      <CopyIcon className="size-3" />
                    </button>
                    <pre className="text-xs/tight text-base-content/90">{chunk.content}</pre>
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
    </div>
  )
}
