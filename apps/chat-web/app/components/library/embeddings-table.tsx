import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { useAuth } from '../../auth/auth-hook'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { ExclamationIcon } from '../../icons/exclamation-icon'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { LoadingSpinner } from '../loading-spinner'
import { DesktopFileUpload } from './desktop-file-upload'
import { GoogleDriveFiles } from './google-drive-files'

interface EmbeddingsTableProps {
  libraryId: string
}

interface AiLibraryFile {
  id: string
  name: string
  size?: number | null
  chunks?: number | null
  processedAt?: string | null
  processingErrorMessage?: string | null
  dropError?: string | null
}

const clearEmbeddings = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation clearEmbeddings($libraryId: String!) {
          clearEmbeddedFiles(libraryId: $libraryId)
        }
      `),
      { libraryId: ctx.data },
    )
  })

const dropAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const dropFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation dropFile($id: String!) {
            dropFile(fileId: $id) {
              id
            }
          }
        `),
        { id: fileId },
      ),
    )
    return await Promise.all(dropFilePromises)
  })

const reProcessAllFiles = createServerFn({ method: 'POST' })
  .validator((data: string[]) => z.array(z.string().nonempty()).parse(data))
  .handler(async (ctx) => {
    const reProcessFilePromises = ctx.data.map((fileId) =>
      backendRequest(
        graphql(`
          mutation reProcessFile($id: String!) {
            processFile(fileId: $id) {
              id
              chunks
              size
              uploadedAt
              processedAt
              processingErrorMessage
            }
          }
        `),
        { id: fileId },
      ),
    )
    return await Promise.all(reProcessFilePromises)
  })

const getLibraryFiles = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) => z.string().nonempty().parse(libraryId))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query EmbeddingsTable($libraryId: String!) {
          aiLibraryFiles(libraryId: $libraryId) {
            id
            name
            originUri
            mimeType
            size
            chunks
            uploadedAt
            processedAt
            processingErrorMessage
            dropError
          }
        }
      `),
      { libraryId: ctx.data },
    )
  })

export const aiLibraryFilesQueryOptions = (libraryId: string) => ({
  queryKey: [queryKeys.AiLibraryFiles, libraryId],
  queryFn: async () => {
    if (!libraryId) {
      return { aiLibraryFiles: [] }
    } else {
      const result = await getLibraryFiles({ data: { libraryId } })
      return { aiLibraryFiles: result?.aiLibraryFiles || [] }
    }
  },
  enabled: !!libraryId,
})

export const EmbeddingsTable = ({ libraryId }: EmbeddingsTableProps) => {
  const { userProfile } = useAuth()
  const remainingStorage = (userProfile?.freeStorage || 0) - (userProfile?.usedStorage || 0)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const { t, language } = useTranslation()
  const { data, isLoading } = useSuspenseQuery<{ aiLibraryFiles: AiLibraryFile[] }>(
    aiLibraryFilesQueryOptions(libraryId),
  )
  const dialogRef = useRef<HTMLDialogElement>(null)
  const googleDriveAccessTokenString = localStorage.getItem('google_drive_access_token')
  const googleDriveAccessToken = googleDriveAccessTokenString ? JSON.parse(googleDriveAccessTokenString) : null
  const queryClient = useQueryClient()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('googleDriveAuth') && googleDriveAccessToken) {
      dialogRef.current?.showModal()
    }
  }, [googleDriveAccessToken])

  const handleGoogleDriveClick = () => {
    if (googleDriveAccessToken) {
      dialogRef.current?.showModal()
    } else {
      window.location.href = `/libraries/auth-google?redirectAfterAuth=${encodeURIComponent(window.location.href)}&googleDriveAuth=true`
    }
  }

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.AiLibraryFiles, libraryId],
    })

    queryClient.invalidateQueries({
      queryKey: [queryKeys.AiLibraries],
    })
  }

  const clearEmbeddingsMutation = useMutation({
    mutationFn: async (libraryId: string) => {
      await clearEmbeddings({ data: libraryId })
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const dropAllFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropAllFiles({ data: fileIds })
    },
    onSettled: () => {
      setSelectedFiles([])
      invalidateQueries()
    },
  })

  const reProcessAllFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await reProcessAllFiles({ data: fileIds })
    },
    onSettled: () => {
      setSelectedFiles([])
      invalidateQueries()
    },
    onError: () => {
      alert('An error occurred while reprocessing the files. Please try again later.')
    },
  })

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === data?.aiLibraryFiles?.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(data?.aiLibraryFiles?.map((file) => file.id) || [])
    }
  }

  const isPending =
    isLoading ||
    clearEmbeddingsMutation.isPending ||
    dropAllFilesMutation.isPending ||
    reProcessAllFilesMutation.isPending

  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    reProcessAllFilesMutation.mutate(uploadedFileIds)
  }

  const truncateFileName = (fileName: string, maxLength: number, truncatedLength: number): string => {
    return fileName.length > maxLength
      ? `${fileName.slice(0, truncatedLength)}...${fileName.slice(fileName.lastIndexOf('.'))}`
      : fileName
  }

  return (
    <>
      <LoadingSpinner isLoading={isPending} />
      <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-xs tooltip tooltip-left"
            data-tip={t('tooltips.clearEmbeddings')}
            onClick={() => clearEmbeddingsMutation.mutate(libraryId)}
            disabled={clearEmbeddingsMutation.isPending}
          >
            {t('actions.clearEmbeddings')}
          </button>
          <DesktopFileUpload
            libraryId={libraryId}
            onUploadComplete={handleUploadComplete}
            disabled={remainingStorage < 1}
          />
          <button type="button" className="btn btn-xs" onClick={handleGoogleDriveClick}>
            {t('libraries.googleDrive')}
          </button>
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => dropAllFilesMutation.mutate(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            {t('actions.drop')}
          </button>
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => reProcessAllFilesMutation.mutate(selectedFiles)}
            disabled={selectedFiles.length === 0}
          >
            {t('actions.reProcess')}
          </button>
        </div>
        <div className="text-right text-sm">
          <div className="font-semibold">{t('labels.remainingStorage')}</div>
          <div>
            {remainingStorage} / {userProfile?.freeStorage}
          </div>
        </div>
      </nav>
      {googleDriveAccessToken && (
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box relative flex w-auto min-w-[300px] max-w-[90vw] flex-col">
            <button
              type="button"
              className="btn btn-ghost btn-sm absolute right-2 top-2"
              onClick={() => dialogRef.current?.close()}
            >
              <CrossIcon />
            </button>
            <h3 className="text-lg font-bold">{t('texts.addGoogleDriveFiles')}</h3>
            <div className="flex-grow overflow-auto">
              <GoogleDriveFiles
                libraryId={libraryId}
                currentLocationHref={window.location.href}
                noFreeUploads={remainingStorage < 100}
                dialogRef={dialogRef}
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => dialogRef.current?.close()}>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </form>
        </dialog>
      )}
      {!data?.aiLibraryFiles?.length ? (
        <div className="mt-6 text-center">{t('texts.noFilesFound')}</div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="block lg:hidden">
            <label className="mb-4 flex gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selectedFiles.length === data?.aiLibraryFiles?.length && data.aiLibraryFiles.length > 0}
                onChange={handleSelectAll}
              />
              <span className="text-sm font-medium">{t('actions.selectAll')}</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {data?.aiLibraryFiles.map((file, index) => (
                <div key={file.id} className="flex flex-col gap-2 rounded-md border border-base-300 p-3 shadow-sm">
                  <div className="flex justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                      />
                      <span className="text-sm font-semibold">
                        {index + 1}. {truncateFileName(file.name, 25, 20)}
                      </span>
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => dropAllFilesMutation.mutate([file.id])}
                        disabled={dropAllFilesMutation.isPending}
                        data-tip={t('tooltips.delete')}
                      >
                        <TrashIcon />
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => reProcessAllFilesMutation.mutate([file.id])}
                        disabled={reProcessAllFilesMutation.isPending}
                      >
                        <ReprocessIcon />
                      </button>
                      {file.processingErrorMessage && (
                        <span className="tooltip tooltip-left flex items-center" data-tip={file.processingErrorMessage}>
                          <ExclamationIcon />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="">{t('labels.size')}:</span>
                    <span>{file.size ?? '-'}</span>
                    <span className="">{t('labels.chunks')}:</span>
                    <span>{file.chunks ?? '-'}</span>
                    <span className="">{t('labels.processed')}:</span>
                    <span>{dateTimeString(file.processedAt, language) || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="table">
              <thead className="bg-base-200">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={selectedFiles.length === data?.aiLibraryFiles?.length && data.aiLibraryFiles.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>#</th>
                  <th>{t('labels.name')}</th>
                  <th>#{t('labels.size')}</th>
                  <th>#{t('labels.chunks')}</th>
                  <th>{t('labels.processed')}</th>
                  <th>{t('labels.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.aiLibraryFiles?.map((file: AiLibraryFile, index: number) => (
                  <tr key={file.id} className="hover:bg-base-200">
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>{truncateFileName(file.name, 49, 45)}</td>
                    <td>{file.size ?? '-'}</td>
                    <td>{file.chunks ?? '-'}</td>
                    <td>{dateTimeString(file.processedAt, language) || '-'}</td>
                    <td className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-xs tooltip tooltip-left"
                        data-tip={t('tooltips.delete')}
                        onClick={() => dropAllFilesMutation.mutate([file.id])}
                        disabled={dropAllFilesMutation.isPending}
                      >
                        <TrashIcon />
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs tooltip tooltip-left"
                        data-tip={t('tooltips.reProcess')}
                        onClick={() => reProcessAllFilesMutation.mutate([file.id])}
                        disabled={reProcessAllFilesMutation.isPending}
                      >
                        <ReprocessIcon />
                      </button>
                      {file.processingErrorMessage && (
                        <span className="tooltip" data-tip={file.processingErrorMessage}>
                          <ExclamationIcon />
                        </span>
                      )}

                      {file.dropError && (
                        <span className="lg:tooltip" data-tip={t('libraries.dropFileError')}>
                          <ExclamationIcon className="fill-warning" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
