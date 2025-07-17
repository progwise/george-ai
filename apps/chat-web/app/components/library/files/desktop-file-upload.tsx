import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { z } from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../../constants'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { FileUploadProgressList } from '../file-upload-progress-list'
import { LibraryFile, LibraryFileSchema } from '../google-files-table'

export interface DesktopFilesProps {
  libraryId: string
  onUploadComplete?: (uploadedFileIds: string[]) => Promise<void>
  disabled?: boolean
}

const PrepareDesktopFileDocument = graphql(`
  mutation prepareDesktopFile($file: AiLibraryFileInput!) {
    prepareFile(data: $file) {
      id
    }
  }
`)

const prepareDesktopFiles = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string; selectedFiles: LibraryFile[] }) =>
    z
      .object({
        libraryId: z.string().nonempty(),
        selectedFiles: z.array(LibraryFileSchema),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const processFiles = ctx.data.selectedFiles.map(async (selectedFile) => {
      const preparedFile = await backendRequest(PrepareDesktopFileDocument, {
        file: {
          name: selectedFile.name,
          originUri: 'desktop',
          mimeType: selectedFile.kind || 'application/pdf',
          libraryId: ctx.data.libraryId,
        },
      })

      if (!preparedFile.prepareFile) {
        throw new Error('Failed to prepare file')
      }

      return {
        fileName: selectedFile.name,
        uploadUrl: `${BACKEND_PUBLIC_URL}/upload`,
        method: 'POST',
        headers: {
          Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
          'x-upload-token': preparedFile.prepareFile.id,
        },
        fileId: preparedFile.prepareFile.id,
      }
    })

    return await Promise.all(processFiles)
  })

const cancelFileUpload = createServerFn({ method: 'POST' })
  .validator((data: object) =>
    z
      .object({
        fileId: z.string().nonempty(),
        libraryId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await backendRequest(
      graphql(`
        mutation cancelFileUpload($fileId: String!, $libraryId: String!) {
          cancelFileUpload(fileId: $fileId, libraryId: $libraryId)
        }
      `),
      { fileId: data.fileId, libraryId: data.libraryId },
    )
  })

export const DesktopFileUpload = ({ libraryId, onUploadComplete, disabled }: DesktopFilesProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const { t } = useTranslation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  // Using Map instead of Record here for better performance and advanced operations like iteration and key order preservation
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(() => new Map())
  const [abortControllers, setAbortControllers] = useState(() => new Map<string, AbortController>())
  const [fileIdMap, setFileIdMap] = useState(() => new Map<string, string>())

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // This fixes upload dialog issues after cancelling or clearing files by resetting the states
  const resetState = () => {
    setSelectedFiles([])
    setUploadProgress(new Map())
    setAbortControllers(new Map())
    setFileIdMap(new Map())
    resetFileInput()
  }

  const handleCancelUpload = async (fileName: string) => {
    const abortController = abortControllers.get(fileName)
    if (abortController) {
      abortController.abort()
      const fileId = fileIdMap.get(fileName)
      if (fileId) {
        try {
          await cancelFileUpload({ data: { fileId, libraryId } })
        } catch (error) {
          console.error(`Error cancelling upload for file ${fileName}:`, error)
        }
      }
      setUploadProgress((prev) => {
        const newProgress = new Map(prev)
        if (fileId) {
          newProgress.set(fileId, -1) // -1 for cancellation
        }
        return newProgress
      })
      setAbortControllers((prev) => {
        const newControllers = new Map(prev)
        newControllers.delete(fileName) // Remove the controller for the cancelled file
        return newControllers
      })
    }
  }

  const handleCancelAllUploads = async () => {
    const cancelPromises = Array.from(fileIdMap.entries()).map(async ([fileName, fileId]) => {
      try {
        await cancelFileUpload({ data: { fileId, libraryId } })
      } catch (error) {
        console.error(`Error cancelling upload for file ${fileName}:`, error)
      }
    })

    await Promise.all(cancelPromises)

    abortControllers.forEach((abortController) => abortController.abort())
    resetState()
    dialogRef.current?.close()
  }

  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    resetState()
    if (onUploadComplete) {
      await onUploadComplete(uploadedFileIds)
    }
  }

  const { mutate: prepareFilesMutation } = useMutation({
    mutationFn: (data: { libraryId: string; selectedFiles: LibraryFile[] }) => prepareDesktopFiles({ data }),
    onSettled: async (preparedFiles, error) => {
      if (error || !preparedFiles) {
        console.error('Error preparing files:', error)
        return
      }

      const uploadedFileIds: string[] = []
      const abortController = new AbortController()
      setAbortControllers((prev) => {
        const newControllers = new Map(prev)
        preparedFiles.forEach((file) => {
          newControllers.set(file.fileName, abortController)
        })
        return newControllers
      })

      // Map file names to their prepared file IDs
      const newFileIdMap = new Map<string, string>()
      preparedFiles.forEach(({ fileName, fileId }) => {
        newFileIdMap.set(fileName, fileId)
      })
      setFileIdMap(newFileIdMap)

      const totalFiles = preparedFiles.length

      // Update counters for completed and canceled uploads
      let completedUploads = 0
      let canceledUploads = 0

      const uploadPromises = preparedFiles.map((file) => {
        const fileBlob = selectedFiles.find((f) => f.name === file.fileName)
        if (!fileBlob) return Promise.resolve()

        const abortController = new AbortController()
        setAbortControllers((prev) => {
          const newControllers = new Map(prev)
          newControllers.set(file.fileName, abortController)
          return newControllers
        })

        return new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open(file.method, file.uploadUrl)

          Object.entries(file.headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value)
          })

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setUploadProgress((prev) => {
                const newProgress = new Map(prev)
                const fileId = newFileIdMap.get(file.fileName)
                if (fileId) {
                  newProgress.set(fileId, (event.loaded / event.total) * 100)
                }
                return newProgress
              })
            }
          }

          xhr.onload = () => {
            if (xhr.status === 200) {
              uploadedFileIds.push(file.fileId)
              completedUploads++
              resolve()
            } else {
              reject(new Error(`Failed to upload file: ${xhr.statusText}`))
            }
          }

          xhr.onerror = () => {
            reject(new Error('Network error during file upload'))
          }

          xhr.onabort = () => {
            canceledUploads++
            reject(new Error('Upload aborted'))
          }

          xhr.send(fileBlob)

          abortController.signal.addEventListener('abort', () => {
            xhr.abort()
          })
        }).catch((error) => {
          console.error(`Error uploading ${file.fileName}:`, error)
          return // Allow other uploads to continue
        })
      })

      await Promise.all(uploadPromises)

      // Dialog closes before reprocessing starts
      if (completedUploads + canceledUploads >= totalFiles) {
        dialogRef.current?.close()
        if (onUploadComplete) {
          await handleUploadComplete(uploadedFileIds)
        }
      }
    },
  })

  const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (files.length === 0) return

    resetState()

    setSelectedFiles(files)

    prepareFilesMutation({
      libraryId,
      selectedFiles: files.map((file) => ({
        id: file.name,
        name: file.name,
        kind: file.type,
      })),
    })

    dialogRef.current?.showModal()
  }

  return (
    <>
      <nav className="flex flex-col gap-4">
        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => {
            resetFileInput()
            fileInputRef.current?.click()
          }}
          disabled={disabled}
        >
          {t('actions.upload')}
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleUploadFiles}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </nav>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="mb-2 text-lg font-bold">{t('texts.uploadingFiles')}</h3>
          <FileUploadProgressList
            selectedFiles={selectedFiles}
            uploadProgress={uploadProgress}
            fileIdMap={fileIdMap}
            handleCancelUpload={handleCancelUpload}
          />
          <div className="modal-action justify-end">
            <button type="button" className="btn btn-sm" onClick={handleCancelAllUploads}>
              {t('actions.cancel')}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
