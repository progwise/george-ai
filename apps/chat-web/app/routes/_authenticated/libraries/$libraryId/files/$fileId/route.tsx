import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { dateTimeString } from '@george-ai/web-utils'

import { toastError, toastSuccess } from '../../../../../../components/georgeToaster'
import { UpdateStatusBadge } from '../../../../../../components/library/crawler/update-status-badge'
import { reprocessFiles } from '../../../../../../components/library/files/change-files'
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

  const { data: fileInfo } = useSuspenseQuery(
    getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
  )

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
    // Invalidate the file info query to refresh the data after reprocessing
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getFileChunksQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: getFileInfoQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: getFileContentQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: getFileSourcesQueryOptions({ fileId: params.fileId, libraryId: params.libraryId }),
      })
    },
  })
  return (
    <>
      <div>
        <LoadingSpinner isLoading={reprocessIsPending} />
        <h2 className="text-2xl font-bold">{fileInfo.aiLibraryFile.name}</h2>
        <div className="text-sm text-gray-500">
          <a href={fileInfo.aiLibraryFile.originUri || '#'} target="blank">
            {fileInfo.aiLibraryFile.originUri}
          </a>
          <span className="mx-2">|</span>
          <span>
            {t('texts.fileCreated')}: {dateTimeString(fileInfo.aiLibraryFile.createdAt, language)}
          </span>
          <span className="mx-2">|</span>
          <span>
            {t('texts.fileUpdated')}: {dateTimeString(fileInfo.aiLibraryFile.updatedAt, language)}
          </span>
          <span className="mx-2">|</span>
          <span>
            {t('texts.fileProcessed')}: {dateTimeString(fileInfo.aiLibraryFile.processedAt, language)}
          </span>
          {fileInfo.aiLibraryFile.originModificationDate && (
            <>
              <span className="mx-2">|</span>
              <span>
                {t('texts.originModified')}: {dateTimeString(fileInfo.aiLibraryFile.originModificationDate, language)}
              </span>
            </>
          )}
          {fileInfo.aiLibraryFile.processingErrorMessage && (
            <>
              <span className="text-red-500">
                {t('texts.fileProcessingError')}: {fileInfo.aiLibraryFile.processingErrorMessage}
              </span>
            </>
          )}
        </div>
        {fileInfo.aiLibraryFile.lastUpdate && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">{t('texts.lastUpdate')}:</span>
            <span className="ml-2">
              <UpdateStatusBadge updateType={fileInfo.aiLibraryFile.lastUpdate.updateType} size="xs" />
            </span>
            <span className="ml-2 text-gray-500">
              {dateTimeString(fileInfo.aiLibraryFile.lastUpdate.createdAt, language)}
            </span>
            {/* Only show message if there was an error */}
            {fileInfo.aiLibraryFile.lastUpdate.updateType === 'error' && (
              <div className="mt-1 text-xs text-red-600">{fileInfo.aiLibraryFile.lastUpdate.message}</div>
            )}
          </div>
        )}
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
              onClick={() => reprocessMutate()}
              disabled={reprocessIsPending}
            >
              {t('actions.reprocess')}
            </button>
          </li>
        </ul>
      </div>
      <div role="tabpanel">
        <Outlet />
      </div>
    </>
  )
}
