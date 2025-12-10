import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'

import { debounce } from '@george-ai/web-utils'

import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { getSimilarFileChunksOptions } from '../../../../../../components/library/files/get-file-similarity'
import { getContentQueriesQueryOptions } from '../../../../../../components/lists/queries'

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
      context.queryClient.ensureQueryData(getContentQueriesQueryOptions({ libraryId: params.libraryId })),
    ])
  },
})

function RouteComponent() {
  const termInputRef = useRef<HTMLTextAreaElement>(null)
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

  const {
    data: { aiContentQueries },
  } = useSuspenseQuery(
    getContentQueriesQueryOptions({
      libraryId: Route.useParams().libraryId,
    }),
  )

  const handleTermChange = useMemo(
    () =>
      debounce(async () => {
        if (!termInputRef.current) return
        const term = termInputRef.current.value
        if (!term || term.length === 0) return
        await navigate({ search: { term, hits } })
      }, 500),
    [navigate, hits],
  )

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      handleTermChange.cancel()
    }
  }, [handleTermChange])

  const handleChunkClick = async (chunkText: string) => {
    if (!termInputRef.current) return
    // Use first 100 characters of chunk text as search term
    const searchTerm = chunkText.slice(0, 100).trim()
    termInputRef.current.value = searchTerm
    await navigate({ search: { term: searchTerm, hits } })
  }

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-base-content text-3xl font-bold">Similarity</h1>
            <p className="text-base-content/70 mt-2">Find semantically similar content in your documents</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-6">
          <div className="form-control w-full">
            <label className="label flex justify-between">
              <span className="label-text font-semibold">Term</span>
              {aiContentQueries.length > 0 && (
                <div className="dropdown-end dropdown">
                  <label tabIndex={0} className="btn btn-ghost btn-sm gap-1 normal-case">
                    Pick List Field Queries
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </label>
                  <div tabIndex={0} className="dropdown-content rounded-box bg-base-100 mt-2 p-2 shadow">
                    {aiContentQueries.map((cq) => (
                      <div key={cq.fieldId} className="card card-xs bg-base-200 mb-2 flex flex-col gap-1 p-2">
                        <div className="card-title text-sm font-semibold">
                          <Link className="link" to="/lists/$listId" params={{ listId: cq.listId }}>
                            {cq.listName} - {cq.fieldName}
                          </Link>
                        </div>
                        <div className="card-body p-0">
                          <pre className="wrap-break-word whitespace-pre-wrap text-xs">
                            {!cq.contentQuery || cq.contentQuery.length < 1
                              ? 'no-content'
                              : cq.contentQuery.length > 200
                                ? `${cq.contentQuery.slice(0, 197)}...`
                                : cq.contentQuery}
                          </pre>
                        </div>
                        <div className="card-actions justify-between">
                          <div className="badge badge-ghost badge-xs text-base-content/40 font-mono">#{cq.fieldId}</div>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline btn-primary self-end"
                            onClick={async () => {
                              if (!termInputRef.current) return
                              termInputRef.current.value = cq.contentQuery || ''
                              await navigate({ search: { term: cq.contentQuery || '', hits } })
                            }}
                          >
                            Take
                          </button>
                        </div>
                        <div className="card-side text-right"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </label>
            <div className="flex gap-2">
              <textarea
                ref={termInputRef}
                defaultValue={term || ''}
                placeholder="What did Michael say? You can enter multiple lines or paste larger text blocks here..."
                className="textarea textarea-bordered focus:textarea-primary max-h-32 min-h-16 flex-1 resize-y"
                onChange={handleTermChange}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {aiSimilarFileChunks.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body py-12 text-center">
              <div className="text-base-content/50">
                <svg className="mx-auto mb-4 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-lg">No similar chunks found</p>
                <p className="mt-1 text-sm">
                  Try adjusting your search terms or check if the document has been processed
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {aiSimilarFileChunks.map((chunk, index) => {
              // Calculate distance gap from previous chunk
              const prevChunk = index > 0 ? aiSimilarFileChunks[index - 1] : null
              const distanceGap =
                prevChunk && chunk.distance && prevChunk.distance ? chunk.distance - prevChunk.distance : 0
              const hasSignificantGap = distanceGap > 0.05 // Threshold for "significant" gap (lowered for 0-1 range)

              // Calculate opacity based on distance (closer = more opaque)
              const maxDistance = 1.0 // Typical max distance
              const normalizedDistance = Math.min((chunk.distance || 0) / maxDistance, 1)
              const opacity = 1 - normalizedDistance * 0.4 // Scale opacity from 1.0 to 0.6 (more noticeable)

              return (
                <React.Fragment key={chunk.id}>
                  {/* Show separator if there's a significant gap */}
                  {hasSignificantGap && index > 0 && (
                    <div className="col-span-full flex items-center justify-center">
                      <div className="text-base-content/40 flex items-center gap-2 text-xs">
                        <div className="bg-base-300 h-px flex-1" />
                        <span>Gap: {distanceGap.toFixed(3)}</span>
                        <div className="bg-base-300 h-px flex-1" />
                      </div>
                    </div>
                  )}

                  <div
                    key={chunk.id}
                    className="card bg-base-100 card-compact shadow-sm transition-all hover:shadow-md"
                    style={{ opacity }}
                  >
                    <div className="card-body p-3">
                      {/* Header with chunk info and similarity score */}
                      <div className="mb-2">
                        <div className="mb-1 flex items-start justify-between">
                          <div
                            className="badge badge-primary badge-outline badge-sm hover:badge-primary hover:text-primary-content cursor-pointer transition-colors"
                            onClick={() => handleChunkClick(chunk.text)}
                            title="Click to search for similar content"
                          >
                            #{chunk.chunkIndex + 1}
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold">
                              {chunk.distance !== undefined && chunk.distance !== null
                                ? chunk.distance.toFixed(10)
                                : 'n/a'}
                            </div>
                          </div>
                        </div>
                        {chunk.fileName && (
                          <div className="text-base-content/70 truncate text-xs" title={chunk.fileName}>
                            {chunk.fileName}
                          </div>
                        )}
                      </div>

                      {/* Content preview - more compact */}
                      <div className="flex-1">
                        <div className="bg-base-200 max-h-20 overflow-y-auto rounded p-2">
                          <pre className="text-base-content/90 text-xs leading-tight">{chunk.text}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
