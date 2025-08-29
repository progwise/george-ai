import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { dateTimeString } from '@george-ai/web-utils'

import { toastError, toastSuccess } from '../../../../../../components/georgeToaster'
import { UpdateStatusBadge } from '../../../../../../components/library/crawler/update-status-badge'
import { reEmbedFiles, reprocessFiles } from '../../../../../../components/library/files/change-files'
import { FileConversionList } from '../../../../../../components/library/files/file-conversations'
import { getFileChunksQueryOptions } from '../../../../../../components/library/files/get-file-chunks'
import { getFileContentQueryOptions } from '../../../../../../components/library/files/get-file-content'
import { getFileInfoQueryOptions } from '../../../../../../components/library/files/get-file-info'
import { getFileSourcesQueryOptions } from '../../../../../../components/library/files/get-file-sources'
import { LoadingSpinner } from '../../../../../../components/loading-spinner'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      ),
    ])
  },
})

function RouteComponent() {
  const { t, language } = useTranslation()
  const params = Route.useParams()
  const { queryClient } = Route.useRouteContext()

  const invalidateQueries = async () => {
    queryClient.invalidateQueries({
      queryKey: getFileChunksQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: getFileContentQueryOptions({ fileId: params.fileId }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: getFileSourcesQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
    })
  }

  const { data: fileInfo } = useSuspenseQuery(
    getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
  )

  const { mutate: embedMutate, isPending: embedIsPending } = useMutation({
    mutationFn: () => reEmbedFiles({ data: [params.fileId] }),
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : t('errors.embedFiles', { error: 'Unknown error' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      const totalChunks = data.reduce((sum, file) => sum + (file.chunks || 0), 0)
      toastSuccess(t('actions.embedSuccess', { count: data.length, chunks: totalChunks }))
    },
    onSettled: () => {
      invalidateQueries()
    },
  })
  const { mutate: reprocessMutate, isPending: reprocessIsPending } = useMutation({
    mutationFn: () => reprocessFiles({ data: [params.fileId] }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.reprocessFile', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      const errorFiles = data.filter(
        (file) => file.processFile.processingErrorMessage && file.processFile.processingErrorMessage.length > 0,
      )
      const successFiles = data.filter(
        (file) => !file.processFile.processingErrorMessage || file.processFile.processingErrorMessage.length === 0,
      )
      if (errorFiles.length > 0) {
        const errorFileNames = errorFiles.map((file) => file.processFile.name || file.processFile.id)
        toastError(
          t('errors.reprocessFiles', {
            count: errorFileNames.length,
            files: errorFileNames.join(', '),
          }),
        )
      }
      if (successFiles.length > 0) {
        const successFileNames = successFiles.map((file) => file.processFile.name || file.processFile.id)
        toastSuccess(
          t('actions.reprocessSuccess', {
            count: successFileNames.length,
            files: successFileNames.join(', '),
          }),
        )
      }
    },
    onSettled: () => {
      invalidateQueries()
    },
  })
  return (
    <>
      <div className="space-y-4">
        <LoadingSpinner isLoading={reprocessIsPending} />

        {/* Title Card with Hero-like styling */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="card-title text-2xl">{fileInfo.aiLibraryFile.name}</h2>
                {fileInfo.aiLibraryFile.originUri && fileInfo.aiLibraryFile.originUri !== 'desktop' && (
                  <div className="">
                    <a
                      href={fileInfo.aiLibraryFile.originUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary block truncate text-sm"
                    >
                      {fileInfo.aiLibraryFile.originUri}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {fileInfo.aiLibraryFile.archivedAt && (
                  <div className="badge badge-warning badge-sm">{t('labels.archived')}</div>
                )}
                {fileInfo.aiLibraryFile.lastUpdate && (
                  <UpdateStatusBadge updateType={fileInfo.aiLibraryFile.lastUpdate.updateType} size="sm" />
                )}
              </div>
            </div>

            {/* Stats for key dates */}
            <div className="stats stats-horizontal mt-4 shadow">
              <div className="stat place-items-center py-2">
                <div className="stat-title text-xs">{t('texts.fileProcessed')}</div>
                <div className="stat-value text-sm">
                  {fileInfo.aiLibraryFile.processedAt
                    ? dateTimeString(fileInfo.aiLibraryFile.processedAt, language)
                    : '-'}
                </div>
              </div>

              <div className="stat place-items-center py-2">
                <div className="stat-title text-xs">{t('texts.fileUpdated')}</div>
                <div className="stat-value text-sm">{dateTimeString(fileInfo.aiLibraryFile.updatedAt, language)}</div>
              </div>

              {fileInfo.aiLibraryFile.originModificationDate && (
                <div className="stat place-items-center py-2">
                  <div className="stat-title text-xs">{t('texts.originModified')}</div>
                  <div className="stat-value text-sm">
                    {dateTimeString(fileInfo.aiLibraryFile.originModificationDate, language)}
                  </div>
                </div>
              )}
            </div>

            {/* Error Alert if present */}
            {fileInfo.aiLibraryFile.processingErrorMessage && (
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
                  <div className="text-xs">{fileInfo.aiLibraryFile.processingErrorMessage}</div>
                </div>
              </div>
            )}

            {/* Last Update info in a subtle way */}
            {fileInfo.aiLibraryFile.lastUpdate && fileInfo.aiLibraryFile.lastUpdate.updateType === 'error' && (
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
                    {t('texts.lastUpdate')}: {dateTimeString(fileInfo.aiLibraryFile.lastUpdate.createdAt, language)}
                  </div>
                  <div className="mt-1 text-xs">{fileInfo.aiLibraryFile.lastUpdate.message}</div>
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
      <FileConversionList conversions={fileInfo.aiLibraryFile.conversions} />
      <div role="tabpanel">
        <Outlet />
      </div>
    </>
  )
}
