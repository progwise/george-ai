import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { FileMarkdownViewer } from '../../../../../../components/library/files/file-markdown-viewer'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { MarkdownFileSelector } from '../../../../../../components/library/files/markdown-file-selector'
import { useMarkdownDownload } from '../../../../../../components/library/files/use-markdown-download'
import { Pagination } from '../../../../../../components/table/pagination'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/')({
  component: RouteComponent,
  validateSearch: z.object({
    markdownUrl: z.string().optional(),
    part: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { markdownUrl, part } }) => ({
    markdownUrl,
    part,
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId }))
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { fileId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { markdownUrl, part } = Route.useSearch()
  const [viewMarkdownSource, setViewMarkdownSource] = useState(false)

  const toggleViewMarkdownSource = () => {
    setViewMarkdownSource((prev) => !prev)
  }
  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId: fileId }))

  // Select the first available extraction by default
  const selectedMarkdownUrl = markdownUrl || (aiLibraryFile.availableExtractions?.[0]?.mainFileUrl ?? undefined)

  // Find the selected extraction for pagination
  const selectedExtraction = aiLibraryFile.availableExtractions.find(
    (extraction) => extraction.mainFileUrl === selectedMarkdownUrl,
  )

  // Build URL with part parameter if specified
  let urlToLoad = selectedMarkdownUrl
  if (part && selectedMarkdownUrl) {
    // Add part as query parameter to the main file URL
    const url = new URL(selectedMarkdownUrl)
    url.searchParams.set('part', part.toString())
    urlToLoad = url.toString()
  }

  const { content, isLoading, progress, error } = useMarkdownDownload({
    url: urlToLoad,
  })
  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MarkdownFileSelector
            file={aiLibraryFile}
            selectedUrl={selectedMarkdownUrl}
            onChange={(url) => navigate({ search: { markdownUrl: url || undefined } })}
          />
          {part && selectedExtraction && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate({ search: { markdownUrl: selectedMarkdownUrl } })}
            >
              ← Back to Summary
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              className={twMerge('toggle toggle-sm', viewMarkdownSource ? 'toggle-primary' : 'toggle-secondary')}
              checked={viewMarkdownSource}
              onChange={toggleViewMarkdownSource}
            />
            <span className={twMerge(viewMarkdownSource ? 'text-primary' : 'opacity-50')}>Source</span>
          </label>
        </div>
      </div>

      {!part && selectedExtraction && selectedExtraction.isBucketed && (
        <div className="flex items-center justify-center">
          <Pagination
            totalItems={selectedExtraction.totalParts}
            currentPage={1}
            itemsPerPage={1}
            onPageChange={(page) => navigate({ search: { markdownUrl: selectedMarkdownUrl, part: page } })}
          />
        </div>
      )}

      {part && selectedExtraction && selectedExtraction.isBucketed && (
        <div className="flex items-center justify-center">
          <Pagination
            totalItems={selectedExtraction.totalParts}
            currentPage={part}
            itemsPerPage={1}
            onPageChange={(page) => navigate({ search: { markdownUrl: selectedMarkdownUrl, part: page } })}
          />
        </div>
      )}

      <div className="min-h-0 min-w-0 overflow-auto rounded-box bg-base-300 p-5">
        {error && (
          <div className="alert alert-error">
            <span>Error loading markdown: {error.message}</span>
          </div>
        )}
        {!error &&
          (viewMarkdownSource ? (
            isLoading ? (
              <div className="flex items-center gap-4 p-8">
                <div className="loading loading-spinner"></div>
                <div>Loading... {progress > 0 && `${Math.round(progress)}%`}</div>
              </div>
            ) : (
              <pre className="text-sm whitespace-pre-wrap">
                <code lang="markdown">{content || t('files.noContentAvailable')}</code>
              </pre>
            )
          ) : (
            <FileMarkdownViewer
              markdown={content || t('files.noContentAvailable')}
              className="text-sm font-semibold"
              isLoading={isLoading}
              progress={progress}
            />
          ))}
      </div>
    </div>
  )
}
