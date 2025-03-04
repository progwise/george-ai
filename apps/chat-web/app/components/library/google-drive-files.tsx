import { Link } from '@tanstack/react-router'
import { GoogleAccessTokenSchema } from '../data-sources/login-google-server'
import { useState } from 'react'
import { FilesTable, LibraryFile, LibraryFileSchema } from './files-table'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { backendRequest, backendUpload } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { LoadingSpinner } from '../loading-spinner'

export interface GoogleDriveFilesProps {
  currentLocationHref: string
  libraryId: string
}

interface GoogleDriveResponse {
  files: [{ id: string; kind: string; name: string }]
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

const embedFiles = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      libraryId: string
      files: Array<LibraryFile>
      access_token: string
    }) =>
      z
        .object({
          libraryId: z.string().nonempty(),
          files: z.array(LibraryFileSchema),
          access_token: z.string().nonempty(),
        })
        .parse(data),
  )
  .handler(async (ctx) => {
    const processFiles = ctx.data.files.map(async (file) => {
      let isPdfExport = true
      const googleDownloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application%2Fpdf`,
        {
          headers: {
            Authorization: `Bearer ${ctx.data.access_token}`,
          },
        },
      ).then(async (response) => {
        if (response.ok) {
          return response
        }

        console.warn(
          'Failed to download file from Google Drive, trying another method',
          `${ctx.data.access_token}`,
          file,
        )
        isPdfExport = false
        return await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&source=downloadUrl`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${ctx.data.access_token}`,
            },
          },
        )
      })

      if (!googleDownloadResponse.ok) {
        console.error('Failed to download file from Google Drive', file)
        const body = await googleDownloadResponse.text()
        console.error('Response', body)
        throw new Error(`Failed to download file from Google Drive: ${file.id}`)
      }

      const blob = await googleDownloadResponse.blob()

      const preparedFile = await backendRequest(PrepareFileDocument, {
        file: {
          name: file.name,
          originUri: `https://drive.google.com/file/d/${file.id}/view`,
          mimeType: isPdfExport ? 'application/pdf' : 'text/plain',
          libraryId: ctx.data.libraryId,
        },
      })

      if (!preparedFile?.prepareFile?.id) {
        throw new Error('Failed to prepare file')
      }

      const uploadResponse = await backendUpload(
        blob,
        preparedFile.prepareFile.id,
      )

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      return await backendRequest(ProcessFileDocument, {
        fileId: preparedFile.prepareFile.id,
      })
    })

    await Promise.all(processFiles)
  })

export const GoogleDriveFiles = ({
  libraryId,
  currentLocationHref,
}: GoogleDriveFilesProps) => {
  const queryClient = useQueryClient()

  const googleDriveAccessTokenString = localStorage.getItem(
    'google_drive_access_token',
  )
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(
    JSON.parse(googleDriveAccessTokenString || '{}'),
  )
  const { data: googleDriveFilesData, isLoading: googleDriveFilesIsLoading } =
    useQuery({
      queryKey: [
        queryKeys.GoogleDriveFiles,
        googleDriveAccessToken.access_token!,
      ],
      enabled: !!googleDriveAccessToken?.access_token,
      queryFn: async () => {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files`,
          {
            headers: {
              Authorization: `Bearer ${googleDriveAccessToken.access_token!}`,
            },
          },
        )
        const responseJson = await response.json()
        return responseJson as GoogleDriveResponse
      },
    })

  const [selectedFiles, setSelectedFiles] = useState<LibraryFile[]>([])
  const { mutate: embedFilesMutation, isPending: embedFilesIsPending } =
    useMutation({
      mutationFn: (data: {
        libraryId: string
        files: LibraryFile[]
        access_token: string
      }) => embedFiles({ data }),
      onSuccess: () => {
        alert('Files embedded successfully')
        setSelectedFiles([])
      },
    })

  const handleEmbedFiles = async (files: LibraryFile[]) => {
    embedFilesMutation({
      libraryId,
      files,
      access_token: googleDriveAccessToken.access_token!,
    })

    queryClient.invalidateQueries({
      queryKey: [queryKeys.AiLibraryFiles, libraryId],
    })
  }

  return (
    <>
      <LoadingSpinner
        isLoading={embedFilesIsPending || googleDriveFilesIsLoading}
      />
      <nav className="flex gap-4 justify-between items-center">
        <div className="flex gap-4">
          <Link
            className="btn btn-xs"
            to="/libraries/auth-google"
            search={{ redirectAfterAuth: currentLocationHref }}
          >
            Login with Google
          </Link>
        </div>
        <button
          type="button"
          disabled={!selectedFiles.length || embedFilesIsPending}
          className="btn btn-xs"
          onClick={async () => {
            await handleEmbedFiles(selectedFiles)
          }}
        >
          Add {selectedFiles.length} files into the Library
        </button>
      </nav>
      {googleDriveFilesData?.files && (
        <FilesTable
          files={googleDriveFilesData.files}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      )}
    </>
  )
}
