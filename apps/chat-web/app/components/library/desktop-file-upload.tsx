import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'

import { BACKEND_PUBLIC_URL, GRAPHQL_API_KEY } from '../../constants'
import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'
import { LoadingSpinner } from '../loading-spinner'
import { LibraryFile, LibraryFileSchema } from './files-table'

export interface DesktopFilesProps {
  libraryId: string
  onUploadComplete?: () => void
}

const PrepareDesktopFileDocument = graphql(`
  mutation prepareDesktopFile($file: AiLibraryFileInput!) {
    prepareFile(data: $file) {
      id
    }
  }
`)

const prepareDesktopFiles = createServerFn({ method: 'POST' })
  .validator((data: { libraryId: string; selectedFiles: Array<LibraryFile> }) =>
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
        uploadUrl: BACKEND_PUBLIC_URL + '/upload',
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

export const DesktopFileUpload = ({
  libraryId,
  onUploadComplete,
}: DesktopFilesProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const { mutate: prepareFilesMutation, isPending: prepareFilesIsPending } =
    useMutation({
      mutationFn: (data: { libraryId: string; selectedFiles: LibraryFile[] }) =>
        prepareDesktopFiles({ data }),
      onSettled: async (data, error) => {
        if (error) {
          console.error('Error preparing files:', error)
          return
        }
        const files = Array.from(selectedFiles!)
        data?.forEach(async (file) => {
          const blob = files.find((f) => f.name === file.fileName)
          await fetch(file.uploadUrl, {
            method: file.method,
            headers: file.headers,
            body: blob,
          })
        })
        if (onUploadComplete) {
          onUploadComplete()
        }
      },
    })

  const handleUploadFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(files)
      prepareFilesMutation({
        libraryId,
        selectedFiles: Array.from(files).map((file) => ({
          id: file.name,
          name: file.name,
          kind: file.type,
        })),
      })
    }
  }

  return (
    <>
      <LoadingSpinner isLoading={prepareFilesIsPending} />
      <nav className="flex gap-4 justify-between items-center">
        <button
          type="button"
          className="btn btn-xs"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          Upload
        </button>
        <input
          type="file"
          multiple
          id="fileInput"
          onChange={handleUploadFiles}
          style={{ display: 'none' }}
        />
      </nav>
    </>
  )
}
