import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { useAuth } from '../../auth/auth-hook'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { DropIcon } from '../../icons/drop-icon'
import { ExclamationIcon } from '../../icons/exclamation-icon'
import { ReprocessIcon } from '../../icons/reprocess-icon'
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

const dropFile = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation dropFile($id: String!) {
          dropFile(fileId: $id) {
            id
          }
        }
      `),
      { id: ctx.data },
    )
  })

const reProcessFile = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
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
      { id: ctx.data },
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

const aiLibraryFilesQueryOptions = (libraryId?: string) => ({
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
  const [showDropFileError, setShowDropFileError] = useState(true)
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

  const {
    mutate: dropFileMutation,
    error: dropFileError,
    isPending: dropFileIsPending,
  } = useMutation({
    mutationFn: async (fileId: string) => {
      await dropFile({ data: fileId })
    },
    onSettled: () => {
      invalidateQueries()
    },
  })

  const reProcessFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await reProcessFile({ data: fileId })
    },
    onSettled: () => {
      invalidateQueries()
    },
    onError: () => {
      alert('An error occurred while reprocessing the file. Please try again later.')
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
    reProcessAllFilesMutation.isPending ||
    dropFileIsPending ||
    reProcessFileMutation.isPending

  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    const uploadedFiles = uploadedFileIds.map((fileId) => reProcessFileMutation.mutateAsync(fileId))
    await Promise.all(uploadedFiles)
  }

  return (
    <>
      <LoadingSpinner isLoading={isPending} />
      {dropFileError && showDropFileError && (
        <div className="alert alert-error mb-4 cursor-pointer" role="alert" onClick={() => setShowDropFileError(false)}>
          <span>{t('texts.dropFileFailure')}</span>
          <ul className="list-disc pl-4">
            <li>{dropFileError.message}</li>
          </ul>
        </div>
      )}
      <nav className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full flex-wrap gap-4">
          <button
            type="button"
            className="btn btn-xs lg:tooltip"
            data-tip={t('tooltips.clearEmbeddings')}
            onClick={() => clearEmbeddingsMutation.mutate(libraryId)}
            disabled={clearEmbeddingsMutation.isPending}
          >
            Clear
          </button>
          <DesktopFileUpload
            libraryId={libraryId}
            onUploadComplete={(uploadedFileIds) => handleUploadComplete(uploadedFileIds)}
            disabled={remainingStorage < 1}
          />
          <button type="button" className="btn btn-xs" onClick={handleGoogleDriveClick}>
            Google Drive
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
          <div className="flex w-full justify-end text-sm">
            <span>
              Remaining storage: {remainingStorage} / {userProfile?.freeStorage}
            </span>
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
            <div className="flex-grow overflow-auto py-4">
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
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedFiles.length === data?.aiLibraryFiles?.length}
                  onChange={handleSelectAll}
                  className="flex justify-center"
                />
              </th>
              <th></th>
              <th>Name</th>
              <th>#Size</th>
              <th>#Chunks</th>
              <th>Processed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.aiLibraryFiles?.map((file: AiLibraryFile, index: number) => (
              <tr key={file.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{file.name}</td>
                <td>{file.size}</td>
                <td>{file.chunks}</td>
                <td>{dateTimeString(file.processedAt, language)}</td>
                <td className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-xs lg:tooltip"
                    onClick={() => dropFileMutation(file.id)}
                    disabled={dropFileIsPending}
                    data-tip={t('tooltips.drop')}
                  >
                    <DropIcon />
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs lg:tooltip"
                    onClick={() => reProcessFileMutation.mutate(file.id)}
                    disabled={reProcessFileMutation.isPending}
                    data-tip={t('tooltips.reProcess')}
                  >
                    <ReprocessIcon />
                  </button>

                  {file.processingErrorMessage ? (
                    <span className="lg:tooltip" data-tip={file.processingErrorMessage}>
                      <ExclamationIcon />
                    </span>
                  ) : undefined}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
