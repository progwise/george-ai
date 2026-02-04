import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-commons'

import { ExtractionSelector, FileMarkdownViewer, useMarkdownDownload } from '../../../../../../components/library/files'
import { getFileInfoQueryOptions } from '../../../../../../components/library/queries'
import { Pagination } from '../../../../../../components/table/pagination'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'
import { getBackendPublicUrlQueryOptions } from '../../../../../../queries'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/')({
  component: RouteComponent,
  validateSearch: z.object({
    extractionMethod: z.enum(EXTRACTION_METHODS).optional(),
    fragment: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { extractionMethod, fragment } }) => ({
    extractionMethod,
    fragment,
  }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId })),
      context.queryClient.ensureQueryData(getBackendPublicUrlQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { fileId, libraryId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { extractionMethod, fragment } = Route.useSearch()
  const [viewMarkdownSource, setViewMarkdownSource] = useState(false)

  const toggleViewMarkdownSource = () => {
    setViewMarkdownSource((prev) => !prev)
  }
  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId: fileId }))

  const { data: BACKEND_PUBLIC_URL } = useSuspenseQuery(getBackendPublicUrlQueryOptions())

  // Check if there are no available extractions
  const hasNoExtractions = !aiLibraryFile.extractions || aiLibraryFile.extractions.length === 0

  // Select the first available extraction by default
  const selectedExtractionMethod = extractionMethod || (aiLibraryFile.extractions?.[0]?.extractionMethod ?? undefined)

  // Find the selected extraction for pagination
  const selectedExtraction = aiLibraryFile.extractions.find(
    (extraction) => extraction.extractionMethod === selectedExtractionMethod,
  )

  // Build URL with part parameter if specified
  let urlToLoad = `${BACKEND_PUBLIC_URL}/library-files/${libraryId}/${fileId}?extraction=${selectedExtractionMethod}`
  if (fragment && selectedExtraction) {
    // Add part as query parameter to the main file URL
    const url = new URL(urlToLoad)
    url.searchParams.set('fragment', fragment.toString())
    urlToLoad = url.toString()
  }

  const { content, isLoading, progress, error } = useMarkdownDownload({
    url: urlToLoad,
  })
  return (
    <div className="flex h-full flex-col gap-2 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExtractionSelector
            file={aiLibraryFile}
            selectedExtractionMethod={selectedExtraction?.extractionMethod}
            onChange={(newExtractionMethod) =>
              navigate({ search: { extractionMethod: newExtractionMethod || undefined } })
            }
          />
          {fragment && selectedExtraction && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate({ search: { extractionMethod: selectedExtractionMethod } })}
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

      {!fragment && selectedExtraction && selectedExtraction.hasFragments && (
        <div className="flex items-center justify-center">
          <Pagination
            totalItems={selectedExtraction.fragmentCount || 0}
            currentPage={1}
            itemsPerPage={1}
            onPageChange={(page) =>
              navigate({ search: { extractionMethod: selectedExtractionMethod, fragment: page } })
            }
          />
        </div>
      )}

      {fragment && selectedExtraction && selectedExtraction.hasFragments && (
        <div className="flex items-center justify-center">
          <Pagination
            totalItems={selectedExtraction.fragmentCount || 0}
            currentPage={fragment}
            itemsPerPage={1}
            onPageChange={(page) =>
              navigate({ search: { extractionMethod: selectedExtractionMethod, fragment: page } })
            }
          />
        </div>
      )}

      <div className="min-h-0 min-w-0 overflow-auto rounded-box bg-base-300 p-5">
        {hasNoExtractions ? (
          <div className="alert alert-info">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">{t('files.noProcessedFiles')}</span>
              <span className="text-sm">{t('files.checkTasksRunning')}</span>
              <button
                type="button"
                className="btn w-fit btn-sm btn-primary"
                onClick={() =>
                  navigate({
                    to: '/libraries/$libraryId/files/$fileId/tasks',
                    params: { libraryId, fileId },
                  })
                }
              >
                {t('files.viewTasks')}
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
