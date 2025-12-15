import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import React, { useRef } from 'react'
import { z } from 'zod'

import { toastSuccess } from '../../../../../../components/georgeToaster'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { getSimilarFileChunksOptions } from '../../../../../../components/library/files/get-file-similarity'
import { getContentQueriesQueryOptions } from '../../../../../../components/lists/queries'
import { CopyIcon } from '../../../../../../icons/copy-icon'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/similarity')({
  component: RouteComponent,
  validateSearch: z.object({
    term: z.string().optional(),
    hits: z.coerce.number().default(20),
    part: z.coerce.number().optional(),
    useQuery: z.coerce.boolean().default(false),
  }),
  loaderDeps: ({ search: { hits, term, part, useQuery } }) => ({
    hits,
    term,
    part,
    useQuery,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getSimilarFileChunksOptions({
          fileId: params.fileId,
          term: deps.term,
          hits: deps.hits,
          part: deps.part,
          useQuery: deps.useQuery,
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
  const { hits, term, part, useQuery } = Route.useSearch()
  const navigate = Route.useNavigate()
  const {
    data: { aiSimilarFileChunks },
  } = useSuspenseQuery(
    getSimilarFileChunksOptions({
      fileId,
      term: term,
      hits: hits,
      part: part,
      useQuery: useQuery,
    }),
  )

  const {
    data: { aiContentQueries },
  } = useSuspenseQuery(
    getContentQueriesQueryOptions({
      libraryId: Route.useParams().libraryId,
    }),
  )

  const handleTermSubmit = async () => {
    if (!termInputRef.current) return
    const term = termInputRef.current.value.trim()
    if (!term || term.length === 0) return
    await navigate({ search: { term, hits, part, useQuery } })
  }

  const handleTermKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Trigger search on Ctrl+Enter or Cmd+Enter
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      await handleTermSubmit()
    }
  }

  const handleChunkClick = async (chunkText: string) => {
    if (!termInputRef.current) return
    // Use first 100 characters of chunk text as search term
    const searchTerm = chunkText.slice(0, 100).trim()
    termInputRef.current.value = searchTerm
    await navigate({ search: { term: searchTerm, hits, part, useQuery } })
  }

  const handleCopyChunk = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toastSuccess('Copied to clipboard')
  }

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-base-content">
              Similarity
              {part !== undefined && <span className="ml-2 badge badge-primary">Part {part}</span>}
            </h1>
            <p className="mt-2 text-base-content/70">Find semantically similar content in your documents</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="input input-xs w-36">
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
                      term,
                      hits,
                      part: value ? parseInt(value, 10) : undefined,
                      useQuery,
                    },
                  })
                }}
              />
            </label>
            <select
              className="select select-xs"
              value={hits}
              onChange={(e) => {
                const newHits = parseInt(e.target.value, 10)
                navigate({
                  search: {
                    term,
                    hits: newHits,
                    part,
                    useQuery,
                  },
                })
              }}
            >
              <option value={20}>20 hits</option>
              <option value={100}>100 hits</option>
              <option value={200}>200 hits</option>
            </select>
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-xs">Vector</span>
              <input
                type="checkbox"
                className="toggle toggle-xs"
                checked={!useQuery}
                onChange={(e) => {
                  navigate({
                    search: {
                      term,
                      hits,
                      part,
                      useQuery: !e.target.checked,
                    },
                  })
                }}
              />
            </label>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-6">
          <div className="w-full">
            <label className="label flex justify-between">
              <span className="font-semibold">Term</span>
              {aiContentQueries.length > 0 && (
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn gap-1 normal-case btn-ghost btn-sm">
                    Pick List Field Queries
                    <svg
                      className="size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </label>
                  <div tabIndex={0} className="dropdown-content mt-2 rounded-box bg-base-100 p-2 shadow-sm">
                    {aiContentQueries.map((cq) => (
                      <div key={cq.id} className="card mb-2 flex flex-col gap-1 bg-base-200 p-2 card-xs">
                        <div className="card-title text-sm font-semibold">
                          <Link className="link" to="/lists/$listId" params={{ listId: cq.listId }}>
                            {cq.listName} - {cq.fieldName}
                          </Link>
                        </div>
                        <div className="card-body p-0">
                          <pre className="text-xs wrap-break-word whitespace-pre-wrap">
                            {!cq.contentQuery || cq.contentQuery.length < 1
                              ? 'no-content'
                              : cq.contentQuery.length > 200
                                ? `${cq.contentQuery.slice(0, 197)}...`
                                : cq.contentQuery}
                          </pre>
                        </div>
                        <div className="card-actions justify-between">
                          <div className="badge badge-ghost font-mono badge-xs text-base-content/40">#{cq.fieldId}</div>
                          <button
                            type="button"
                            className="btn self-end btn-outline btn-xs btn-primary"
                            onClick={async () => {
                              if (!termInputRef.current) return
                              termInputRef.current.value = cq.contentQuery || ''
                              await navigate({ search: { term: cq.contentQuery || '', hits, part, useQuery } })
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
                className="textarea max-h-32 min-h-16 flex-1 resize-y focus:textarea-primary"
                onKeyDown={handleTermKeyDown}
                onBlur={handleTermSubmit}
                rows={2}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTermSubmit}
                title="Search (or press Ctrl+Enter)"
              >
                Search
              </button>
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
                <svg className="mx-auto mb-4 size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="flex items-center gap-2 text-xs text-base-content/40">
                        <div className="h-px flex-1 bg-base-300" />
                        <span>Gap: {distanceGap.toFixed(3)}</span>
                        <div className="h-px flex-1 bg-base-300" />
                      </div>
                    </div>
                  )}

                  <div
                    key={chunk.id}
                    className="card bg-base-100 shadow-sm transition-all hover:shadow-md"
                    style={{ opacity }}
                  >
                    <div className="card-body p-3">
                      {/* Header with chunk info and similarity score */}
                      <div className="mb-2">
                        <div className="mb-1 flex items-start justify-between">
                          <div>
                            <div
                              className="badge cursor-pointer badge-outline badge-sm transition-colors badge-primary hover:text-primary-content hover:badge-primary"
                              onClick={() => handleChunkClick(chunk.text)}
                              title="Click to search for similar content"
                            >
                              #{chunk.chunkIndex + 1}
                            </div>
                            {chunk.subChunkIndex > 0 && (
                              <span className="ml-1 badge badge-ghost badge-xs">sub {chunk.subChunkIndex + 1}</span>
                            )}
                            {chunk.part && <span className="ml-1 badge badge-ghost badge-xs">part {chunk.part}</span>}
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold">
                              {chunk.distance !== undefined && chunk.distance !== null
                                ? chunk.distance.toFixed(10)
                                : 'n/a'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Path information */}
                      <div className="mb-2">
                        <div className="truncate text-xs text-base-content/70" title={chunk.headingPath}>
                          {chunk.headingPath}
                        </div>
                      </div>

                      {/* Content preview - more compact */}
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
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
