import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { z } from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../constants'
import { graphql } from '../../gql'
import { CrossIcon } from '../../icons/cross-icon'
import { FileIcon } from '../../icons/file-icon'
import { backendRequest } from '../../server-functions/backend'
import { LibraryFile, LibraryFileSchema } from './files-table'

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
  .validator((data: { fileId: string }) =>
    z
      .object({
        fileId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    await backendRequest(
      graphql(`
        mutation cancelFileUpload($fileId: String!) {
          cancelFileUpload(fileId: $fileId)
        }
      `),
      { fileId: ctx.data.fileId },
    )
  })

export const DesktopFileUpload = ({ libraryId, onUploadComplete, disabled }: DesktopFilesProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(() => new Map())
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const [abortControllers, setAbortControllers] = useState(() => new Map<string, AbortController>())
  const [fileIdMap, setFileIdMap] = useState(() => new Map<string, string>())

  const handleCancelUpload = async (fileName: string) => {
    const abortController = abortControllers.get(fileName)
    if (abortController) {
      abortController.abort()
      const fileId = fileIdMap.get(fileName)
      if (fileId) {
        try {
          await cancelFileUpload({ data: { fileId } })
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

  const handleCancelAllUploads = () => {
    abortControllers.forEach((abortController) => abortController.abort())
    setUploadProgress((prev) => {
      const newProgress = new Map(prev)
      abortControllers.forEach((_, fileName) => {
        const fileId = fileIdMap.get(fileName)
        if (fileId) {
          newProgress.set(fileId, -1) // Mark all as cancelled
        }
      })
      return newProgress
    })
    setAbortControllers(new Map())
    dialogRef.current?.close()
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

      try {
        await Promise.all(uploadPromises)

        // Ensure dialog closes after all files are processed or cancelled
        if (completedUploads + canceledUploads >= totalFiles) {
          if (onUploadComplete) {
            await onUploadComplete(uploadedFileIds)
          }
          dialogRef.current?.close()
        }
      } catch (err) {
        console.error('Error during file upload:', err)
        // Ensure the dialog is closed even if an error occurs
        if (completedUploads + canceledUploads >= totalFiles) {
          if (onUploadComplete) {
            await onUploadComplete(uploadedFileIds)
          }
          dialogRef.current?.close()
        }
      }
    },
  })

  const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (files.length === 0) return

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
        <button type="button" className="btn btn-xs" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          Upload
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
          <h3 className="mb-2 text-lg font-bold">Uploading Files</h3>
          <ul className="space-y-2">
            {selectedFiles.map((file) => {
              const fileId = fileIdMap.get(file.name) || file.name
              const progress = uploadProgress.get(fileId)
              const fileSize =
                file.size >= 1000000 ? (file.size / 1000000).toFixed(1) + ' MB' : (file.size / 1000).toFixed(1) + ' KB'

              return (
                <li key={file.name} className="flex items-center justify-between gap-2 text-gray-700">
                  <div className="flex w-1/2 items-center gap-2">
                    <FileIcon />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{fileSize}</span>
                    {progress === -1 ? (
                      <span className="text-red-500">Cancelled</span>
                    ) : progress === 100 ? (
                      <span className="text-green-500">Uploaded</span>
                    ) : (
                      // Progress Bar
                      <div className="relative h-2 w-20 rounded bg-gray-200">
                        <div
                          className="absolute left-0 top-0 h-2 rounded bg-blue-500 transition-all duration-200"
                          style={{
                            width: `${progress || 0}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                  {progress !== -1 && progress !== 100 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleCancelUpload(file.name)}
                    >
                      <CrossIcon />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="modal-action justify-end">
            <button type="button" className="btn btn-sm" onClick={handleCancelAllUploads}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
