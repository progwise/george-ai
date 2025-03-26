import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { z } from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../constants'
import { graphql } from '../../gql'
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

export const DesktopFileUpload = ({ libraryId, onUploadComplete, disabled }: DesktopFilesProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(() => new Map<string, number>())
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [fileIdMap, setFileIdMap] = useState(() => new Map<string, string>())

  const handleCancelUpload = () => {
    abortControllerRef.current?.abort()
    setUploadProgress(new Map())
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
      abortControllerRef.current = new AbortController()

      // Map file names to their prepared file IDs
      const newFileIdMap = new Map<string, string>()
      preparedFiles.forEach(({ fileName, fileId }) => {
        newFileIdMap.set(fileName, fileId)
      })
      setFileIdMap(newFileIdMap)

      for (const file of preparedFiles) {
        const fileBlob = selectedFiles.find((f) => f.name === file.fileName)
        if (!fileBlob) continue

        await new Promise<void>((resolve, reject) => {
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
              resolve()
            } else {
              reject(new Error(`Failed to upload file: ${xhr.statusText}`))
            }
          }

          xhr.onerror = () => reject(new Error('Network error during file upload'))

          xhr.send(fileBlob)
        })
      }

      if (onUploadComplete) {
        await onUploadComplete(uploadedFileIds)
      }
      dialogRef.current?.close()
    },
  })

  const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (files.length === 0) return

    setSelectedFiles(files)
    abortControllerRef.current = new AbortController()

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
          <h3 className="text-lg font-bold">Uploading Files</h3>
          <ul className="space-y-2">
            {selectedFiles.map((file) => {
              const fileId = fileIdMap.get(file.name) || file.name
              return (
                <li key={file.name} className="flex items-center gap-2">
                  <span className="w-1/2 truncate">{file.name}</span>
                  <div className="relative h-2 w-full rounded bg-gray-200">
                    <div
                      className="absolute left-0 top-0 h-2 rounded bg-blue-500 transition-all duration-200"
                      style={{ width: `${uploadProgress.get(fileId) || 0}%` }}
                    ></div>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="modal-action justify-end">
            <button type="button" className="btn btn-sm" onClick={handleCancelUpload}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
