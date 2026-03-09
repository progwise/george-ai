import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { DocumentExtractionViewer, ExtractionSelector } from '../../../../../../components/library/files'
import { getExtractionQueryOptions, getFileQueryOptions } from '../../../../../../components/library/queries'
import { Pagination } from '../../../../../../components/table/pagination'
import { ExtractionMethodSchema } from '../../../../../../gql/validation'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'
import { getBackendPublicUrlQueryOptions } from '../../../../../../queries'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/')({
  component: RouteComponent,
  validateSearch: z.object({
    extractionMethod: ExtractionMethodSchema.optional(),
    fragment: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { extractionMethod, fragment } }) => ({
    extractionMethod,
    fragment,
  }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getExtractionQueryOptions({ ...params, ...deps })),
      context.queryClient.ensureQueryData(getFileQueryOptions(params)),
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

  const { data: aiLibraryFile } = useSuspenseQuery(getFileQueryOptions({ fileId, libraryId }))
  const { data: backendPublicUrl } = useSuspenseQuery(getBackendPublicUrlQueryOptions())

  const { data: { extraction: selectedExtraction } = {} } = useSuspenseQuery(
    getExtractionQueryOptions({
      fileId,
      libraryId,
      extractionMethod,
    }),
  )

  return (
    <div className="grid size-full grid-rows-[auto_1fr] gap-2 bg-base-100">
      <div className="grid w-full grid-cols-2 items-center gap-4">
        <ExtractionSelector
          documentId={fileId}
          libraryId={libraryId}
          sourceHash={aiLibraryFile.manifest?.sourceHash}
          extractions={aiLibraryFile.manifest?.extractions || []}
          selectedExtractionMethod={selectedExtraction?.extractionMethod}
          availableExtractionMethods={aiLibraryFile.supportedExtractionMethods || []}
        />
        <ul className="menu menu-horizontal w-full items-center justify-end menu-sm">
          <li className="flex items-center"></li>
          {fragment && selectedExtraction && (
            <li>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate({ search: { extractionMethod: selectedExtraction?.extractionMethod } })}
              >
                ← Back to Summary
              </button>
            </li>
          )}
          {!fragment && selectedExtraction && selectedExtraction.hasFragments && (
            <li className="flex items-center justify-center">
              <Pagination
                totalItems={selectedExtraction.fragmentCount || 0}
                currentPage={1}
                itemsPerPage={1}
                onPageChange={(page) =>
                  navigate({ search: { extractionMethod: selectedExtraction?.extractionMethod, fragment: page } })
                }
              />
            </li>
          )}
          {fragment && selectedExtraction && selectedExtraction.hasFragments && (
            <li className="flex items-center justify-center">
              <Pagination
                totalItems={selectedExtraction.fragmentCount || 0}
                currentPage={fragment}
                itemsPerPage={1}
                onPageChange={(page) =>
                  navigate({ search: { extractionMethod: selectedExtraction?.extractionMethod, fragment: page } })
                }
              />
            </li>
          )}

          <li>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                className={twMerge('toggle toggle-sm', viewMarkdownSource ? 'toggle-primary' : 'toggle-secondary')}
                checked={viewMarkdownSource}
                onChange={() => setViewMarkdownSource((prev) => !prev)}
              />
              <span className={twMerge(viewMarkdownSource ? 'text-primary' : 'opacity-50')}>Source</span>
            </label>
          </li>
        </ul>
      </div>

      <div className="overflow-auto">
        {!selectedExtraction ? (
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
          <DocumentExtractionViewer
            libraryId={libraryId}
            documentId={fileId}
            extractionMethod={selectedExtraction.extractionMethod}
            fragment={fragment}
            className="text-sm font-semibold"
            backendPublicUrl={backendPublicUrl}
            viewMarkdownSource={viewMarkdownSource}
          />
        )}
      </div>
    </div>
  )
}
