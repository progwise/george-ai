import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { debounce } from '@george-ai/web-utils'

import { FormattedMarkdown } from '../../../../../../components/formatted-markdown'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { getSimilarFileChunksOptions } from '../../../../../../components/library/files/get-file-similarity'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/similarity')({
  component: RouteComponent,
  validateSearch: z.object({
    term: z.string().optional(),
    hits: z.coerce.number().default(20),
  }),
  loaderDeps: ({ search: { hits, term } }) => ({
    hits,
    term,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getSimilarFileChunksOptions({
          fileId: params.fileId,
          term: deps.term,
          hits: deps.hits,
        }),
      ),
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
    ])
  },
})

function RouteComponent() {
  const termInputRef = useRef<HTMLInputElement>(null)
  const { fileId } = Route.useParams()
  const { hits, term } = Route.useSearch()
  const navigate = Route.useNavigate()
  const {
    data: { aiSimilarFileChunks },
  } = useSuspenseQuery(
    getSimilarFileChunksOptions({
      fileId,
      term: term,
      hits: hits,
    }),
  )

  const handleSearchClicked = async () => {
    if (!termInputRef.current) return
    const term = termInputRef.current.value
    if (!term || term.length === 0) return
    console.log('Searching for term:', term)
    await navigate({ search: { term, hits } })
  }

  const handleTermChange = debounce(async () => {
    if (!termInputRef.current) return
    const term = termInputRef.current.value
    if (!term || term.length === 0) return
    console.log('Searching for term:', term)
    await navigate({ search: { term, hits } })
  }, 500)

  return (
    <div className="">
      <div className="mb-4 flex w-full items-center justify-between gap-6">
        <div className="flex flex-grow items-center">
          <label className="input flex-grow">
            Term:
            <input
              ref={termInputRef}
              type="text"
              className="grow"
              placeholder="What did Michael say?"
              onChange={handleTermChange}
            />
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
        <h3 className="text-xl font-bold">Testing for Similarity</h3>
      </div>
      <hr className="text-base-300 mb-4" />
      <div className="flex flex-wrap gap-4">
        {aiSimilarFileChunks.length === 0 && <div className="text-base-content/50 italic">No similar chunks found</div>}
        {aiSimilarFileChunks.map((chunk) => (
          <div key={chunk.id} className="card card-border bg-base-200 card-xs shadow-sm">
            <div className="card-body">
              <h2 className="flex justify-between">
                <div>Chunk {chunk.chunkIndex + 1}</div>
                <div>
                  {' '}
                  Distance:{' '}
                  <b>{chunk.distance !== undefined && chunk.distance !== null ? chunk.distance.toFixed(10) : 'n/a'}</b>
                </div>
              </h2>
              <p>
                Path:
                {chunk.headingPath} {chunk.subChunkIndex > 0 ? `(part-${chunk.subChunkIndex + 1})` : ''}
              </p>
              <div>
                <pre>{chunk.text}</pre>
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
