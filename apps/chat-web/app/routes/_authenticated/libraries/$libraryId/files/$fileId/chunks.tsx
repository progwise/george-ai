import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'
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
          skip: deps.skipChunks,
          take: deps.takeChunks,
        }),
      ),
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
    ])
  },
})

function RouteComponent() {
  const searchInputRef = useRef<HTMLInputElement>(null)
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

  const handleSearchClicked = () => {
    if (!searchInputRef.current) return
    const query = searchInputRef.current.value
    if (!query || query.length === 0) return

    navigate({ search: { skipChunks, takeChunks } })
  }

  return (
    <div className="">
      <div className="mb-4 flex w-full items-end justify-between">
        <h3 className="text-xl font-bold">
          Chunk {aiFileChunks.skip + 1} - {Math.min(aiFileChunks.skip + 1 + aiFileChunks.take, aiFileChunks.count)} of{' '}
          {aiFileChunks.count} Chunks
        </h3>
        <div className="flex items-center">
          <label className="input w-100">
            Find Similarity:
            <input ref={searchInputRef} type="text" className="grow" placeholder="What did Michael say?" />
            <button type="button" className={twMerge('btn btn-xs btn-primary')} onClick={() => handleSearchClicked()}>
              <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
            </button>
          </label>
        </div>
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
      <hr className="text-base-300 mb-4" />
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
