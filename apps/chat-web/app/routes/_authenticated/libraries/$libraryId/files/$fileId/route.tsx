import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { dateTimeString } from '@george-ai/web-utils'

import { toastError, toastSuccess } from '../../../../../../components/georgeToaster'
import { UpdateStatusBadge } from '../../../../../../components/library/crawler/update-status-badge'
import { createEmbeddingTasks, createExtractionTasks } from '../../../../../../components/library/files/change-files'
import { FileCaptionCard } from '../../../../../../components/library/files/file-caption-card'
import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { LoadingSpinner } from '../../../../../../components/loading-spinner'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([context.queryClient.ensureQueryData(getFileInfoQueryOptions({ fileId: params.fileId }))])
  },
})

function RouteComponent() {
  const { t, language } = useTranslation()
  const params = Route.useParams()
  const { queryClient } = Route.useRouteContext()

  const invalidateQueries = async () => {
    queryClient.invalidateQueries({
      queryKey: getFileChunksQueryOptions({ fileId: params.fileId }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: getFileInfoQueryOptions({ fileId: params.fileId }).queryKey,
    })
  }

  const {
    data: { aiLibraryFile },
  } = useSuspenseQuery(getFileInfoQueryOptions({ fileId: params.fileId }))

  const { mutate: embedMutate, isPending: embedIsPending } = useMutation({
    mutationFn: () => createEmbeddingTasks({ data: { fileIds: [params.fileId] } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.createEmbeddingTasks', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.createEmbeddingTasksSuccess', { count: data.length }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })
  const { mutate: reprocessMutate, isPending: reprocessIsPending } = useMutation({
    mutationFn: () => createExtractionTasks({ data: { fileIds: [params.fileId] } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.createExtractionTasks', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.createExtractionTasksSuccess', { count: data.length }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })
  return (
    <div className="">
      <div className="space-y-4">
        <LoadingSpinner isLoading={reprocessIsPending || embedIsPending} />
        <FileCaptionCard file={aiLibraryFile} />

        {/* Title Card with Hero-like styling */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="card-title text-2xl">{aiLibraryFile.name}</h2>
                {aiLibraryFile.originUri && aiLibraryFile.originUri !== 'desktop' && (
                  <div className="">
                    <a
                      href={aiLibraryFile.originUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary block truncate text-sm"
                    >
                      {aiLibraryFile.originUri}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {aiLibraryFile.archivedAt && <div className="badge badge-warning badge-sm">{t('labels.archived')}</div>}
                {aiLibraryFile.lastUpdate && (
                  <UpdateStatusBadge updateType={aiLibraryFile.lastUpdate.updateType} size="sm" />
                )}
              </div>
            </div>

            {/* Stats for key dates */}
            <div className="stats stats-horizontal mt-4 shadow">
              <div className="stat place-items-center py-2">
                <div className="stat-title text-xs">{t('texts.fileProcessed')}</div>
                <div className="stat-value text-sm">
                  {aiLibraryFile.lastSuccessfulEmbedding
                    ? dateTimeString(aiLibraryFile.lastSuccessfulEmbedding.embeddingFinishedAt, language)
                    : '-'}
                </div>
              </div>

              <div className="stat place-items-center py-2">
                <div className="stat-title text-xs">{t('texts.fileUpdated')}</div>
                <div className="stat-value text-sm">{dateTimeString(aiLibraryFile.updatedAt, language)}</div>
              </div>

              {aiLibraryFile.originModificationDate && (
                <div className="stat place-items-center py-2">
                  <div className="stat-title text-xs">{t('texts.originModified')}</div>
                  <div className="stat-value text-sm">
                    {dateTimeString(aiLibraryFile.originModificationDate, language)}
                  </div>
                </div>
              )}
            </div>

            {/* Error Alert if present */}
            {aiLibraryFile && (
              <div className="alert alert-error mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">{t('texts.fileProcessingError')}</h3>
                  <div className="text-xs">{aiLibraryFile.processingStatus}</div>
                </div>
              </div>
            )}

            {/* Last Update info in a subtle way */}
            {aiLibraryFile.lastUpdate && aiLibraryFile.lastUpdate.updateType === 'error' && (
              <div className="alert alert-warning mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <div className="text-xs">
                    {t('texts.lastUpdate')}: {dateTimeString(aiLibraryFile.lastUpdate.createdAt, language)}
                  </div>
                  <div className="mt-1 text-xs">{aiLibraryFile.lastUpdate.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <ul className="menu bg-base-200 menu-horizontal rounded-box gap-2">
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
              to="/libraries/$libraryId/files/$fileId"
              params={params}
            >
              Content
            </Link>
          </li>
          <li>
            <Link
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: false }}
              to="/libraries/$libraryId/files/$fileId/chunks"
              params={params}
            >
              Chunks
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => embedMutate()}
              disabled={embedIsPending || reprocessIsPending}
            >
              {t('actions.reembed')}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => reprocessMutate()}
              disabled={reprocessIsPending || embedIsPending}
            >
              {t('actions.reprocess')}
            </button>
          </li>
        </ul>
      </div>
      <div role="tabpanel">
        <Outlet />
      </div>
    </div>
  )
}
