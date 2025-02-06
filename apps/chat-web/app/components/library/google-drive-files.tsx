import { Link } from '@tanstack/react-router'
import { GoogleAccessTokenSchema } from '../data-sources/login-google-server'
import { useState } from 'react'
import { FilesTable, LibraryFile, LibraryFileSchema } from './files-table'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest, backendUpload } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { LoadingSpinner } from '../loading-spinner'

export interface GoogleDriveFilesProps {
  currentLocationHref: string
  aiLibraryId: string
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
      aiLibraryId: string
      files: Array<LibraryFile>
      access_token: string
    }) =>
      z
        .object({
          aiLibraryId: z.string().nonempty(),
          files: z.array(LibraryFileSchema),
          access_token: z.string().nonempty(),
        })
        .parse(data),
  )
  .handler(async (ctx) => {
    const processFiles = ctx.data.files.map(async (file) => {
      const preparedFile = await backendRequest(PrepareFileDocument, {
        file: {
          name: file.name,
          originUri: `https://drive.google.com/file/d/${file.id}/view`,
          mimeType: 'application/pdf',
          aiLibraryId: ctx.data.aiLibraryId,
        },
      })

      if (!preparedFile?.prepareFile?.id) {
        throw new Error('Failed to prepare file')
      }

      const googleDownloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application%2Fpdf`,
        {
          headers: {
            Authorization: `Bearer ${ctx.data.access_token}`,
          },
        },
      )

      if (!googleDownloadResponse.body) {
        throw new Error(`Failed to download file from Google Drive: ${file.id}`)
      }

      const blob = await googleDownloadResponse.blob()

      const uploadResponse = await backendUpload(
        blob,
        preparedFile?.prepareFile?.id,
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
  aiLibraryId,
  currentLocationHref,
}: GoogleDriveFilesProps) => {
  const queryClient = useQueryClient()
  const [googleDriveResponse, setGoogleDriveResponse] = useState<
    GoogleDriveResponse | undefined
  >(undefined)

  const [selectedFiles, setSelectedFiles] = useState<LibraryFile[]>([])
  const { mutate: embedFilesMutation, isPending: embedFilesIsPending } =
    useMutation({
      mutationFn: embedFiles,
      onSuccess: () => {
        alert('Files embedded successfully')
        setSelectedFiles([])
      },
    })

  const googleDriveAccessTokenString = localStorage.getItem(
    'google_drive_access_token',
  )
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(
    JSON.parse(googleDriveAccessTokenString || '{}'),
  )

  const getGoogleDriveFiles = async (accessToken: string) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = await response.json()
    setGoogleDriveResponse(responseJson as GoogleDriveResponse)
  }

  const handleEmbedFiles = async (files: LibraryFile[]) => {
    await embedFilesMutation({
      data: {
        aiLibraryId,
        files,
        access_token: googleDriveAccessToken.access_token!,
      },
    })
    queryClient.invalidateQueries({
      queryKey: [queryKeys.AiLibraryFiles, aiLibraryId],
    })
  }

  return (
    <>
      <LoadingSpinner isLoading={embedFilesIsPending} />
      <nav className="flex gap-4 justify-between items-center">
        <div className="flex gap-4">
          <Link
            className="btn btn-xs"
            to="/library/auth-google"
            search={{ redirectAfterAuth: currentLocationHref }}
          >
            Login with Google
          </Link>
          <button
            type="button"
            disabled={!googleDriveAccessToken?.access_token}
            className="btn btn-xs"
            onClick={() =>
              getGoogleDriveFiles(googleDriveAccessToken.access_token!)
            }
          >
            Get Google Drive Files
          </button>
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
      {googleDriveResponse?.files && (
        <FilesTable
          files={googleDriveResponse.files}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      )}
    </>
  )
}
