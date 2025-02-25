import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { LoadingSpinner } from '../loading-spinner'
import { LibraryFile, LibraryFileSchema } from './files-table'
import { createServerFn } from '@tanstack/start'
import { BACKEND_URL, GRAPHQL_API_KEY } from '../../constants'

export interface DesktopFilesProps {
  libraryId: string
  fileInputRef: React.RefObject<HTMLInputElement>
}

const PrepareFileDocument = graphql(`
  mutation prepareFile($file: AiLibraryFileInput!) {
    prepareFile(data: $file) {
      id
    }
  }
`)

const ProcessFileDocument = graphql(`
  mutation processFile($fileId: String!) {
    processFile(fileId: $fileId) {
      id
      chunks
      size
      uploadedAt
      processedAt
    }
  }
`)

const prepareFiles = createServerFn({ method: 'POST' })
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
      const preparedFile = await backendRequest(PrepareFileDocument, {
        file: {
          name: selectedFile.name,
          originUri: '',
          mimeType: selectedFile.kind || 'application/pdf',
          libraryId: ctx.data.libraryId,
        },
      })
      return {
        fileName: selectedFile.name,
        uploadUrl: BACKEND_URL + '/upload',
        method: 'POST',
        headers: {
          Authorization: `ApiKey ${GRAPHQL_API_KEY}`,
          'x-upload-token': preparedFile.prepareFile?.id || '',
        },
        fileId: preparedFile.prepareFile?.id || '',
      }
    })

    return await Promise.all(processFiles)
  })

export const DesktopFiles = ({
  libraryId,
  fileInputRef,
}: DesktopFilesProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { mutate: prepareFilesMutation, isPending: prepareFilesIsPending } =
    useMutation({
      mutationFn: (data: { libraryId: string; selectedFiles: LibraryFile[] }) =>
        prepareFiles({ data }),
      onSettled: async (data, error) => {
        if (error) {
          console.error('Error preparing files:', error)
          setIsUploading(false)
          return
        }
        const files = Array.from(selectedFiles!)
        data?.forEach(async (file) => {
          const blob = files.find((f) => f.name === file.fileName)
          console.log('Uploading file:', file.fileName)
          await fetch(file.uploadUrl, {
            method: file.method,
            headers: file.headers,
            body: blob,
          })
          await backendRequest(ProcessFileDocument, { fileId: file.fileId })
        })
        setIsUploading(false)
      },
    })

  const handleEmbedFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(files)
      setIsUploading(true)
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
      <LoadingSpinner isLoading={prepareFilesIsPending || isUploading} />
      <nav className="flex gap-4 justify-between items-center">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleEmbedFiles}
          style={{ display: 'none' }}
        />
      </nav>
    </>
  )
}
