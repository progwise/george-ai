import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { getProfileQueryOptions } from '../../auth/get-profile-query'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest, backendUpload } from '../../server-functions/backend'
import { GoogleAccessTokenSchema, validateGoogleAccessToken } from '../data-sources/login-google-server'
import { toastError, toastSuccess } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { FilesTable, LibraryFile, LibraryFileSchema } from './files-table'

export interface GoogleDriveFilesProps {
  currentLocationHref: string
  libraryId: string
  noFreeUploads: boolean
  dialogRef: React.RefObject<HTMLDialogElement | null>
  userId: string
}

interface GoogleDriveResponse {
  files: [{ id: string; kind: string; name: string; size?: number }]
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
  .validator((data: { libraryId: string; files: Array<LibraryFile>; access_token: string }) =>
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
        return await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&source=downloadUrl`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${ctx.data.access_token}`,
          },
        })
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

      const uploadResponse = await backendUpload(blob, preparedFile.prepareFile.id)

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      return await backendRequest(ProcessFileDocument, {
        fileId: preparedFile.prepareFile.id,
      })
    })

    const results = await Promise.allSettled(processFiles)
    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => (result as PromiseRejectedResult).reason)
    if (errors.length > 0) {
      throw new Error(`Failed to process some files:\n${errors.join('\n')}`)
    }
  })

export const GoogleDriveFiles = ({
  libraryId,
  currentLocationHref,
  noFreeUploads,
  dialogRef,
  userId,
}: GoogleDriveFilesProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const googleDriveAccessTokenString = localStorage.getItem('google_drive_access_token')
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(googleDriveAccessTokenString || '{}'))
  const { data: googleDriveFilesData, isLoading: googleDriveFilesIsLoading } = useQuery({
    queryKey: [queryKeys.GoogleDriveFiles, googleDriveAccessToken.access_token!],
    enabled: !!googleDriveAccessToken?.access_token,
    queryFn: async () => {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,size)`, {
        headers: {
          Authorization: `Bearer ${googleDriveAccessToken.access_token!}`,
        },
      })
      const responseJson = await response.json()
      return responseJson as GoogleDriveResponse
    },
  })

  const [selectedFiles, setSelectedFiles] = useState<LibraryFile[]>([])
  const { mutate: embedFilesMutation, isPending: embedFilesIsPending } = useMutation({
    mutationFn: (data: { libraryId: string; files: LibraryFile[]; access_token: string }) => embedFiles({ data }),
    onSuccess: () => {
      toastSuccess('Files embedded successfully')
      setSelectedFiles([])
      queryClient.invalidateQueries({
        queryKey: [queryKeys.AiLibraryFiles, libraryId],
      })

      queryClient.invalidateQueries(getProfileQueryOptions(userId))
    },
    onError: (error) => {
      toastError(`Error embedding files: ${error.message}`)
    },
  })

  const handleEmbedFiles = async (files: LibraryFile[]) => {
    embedFilesMutation({
      libraryId,
      files,
      access_token: googleDriveAccessToken.access_token!,
    })
  }

  const handleSwitchAccount = () => {
    localStorage.removeItem('google_drive_access_token')
    window.location.href = `/libraries/auth-google?prompt=select_account&redirectAfterAuth=${encodeURIComponent(window.location.href)}`
  }

  useEffect(() => {
    if (googleDriveAccessToken.access_token && localStorage.getItem('google_drive_dialog_open') === 'true') {
      dialogRef.current?.showModal()
      localStorage.removeItem('google_drive_dialog_open')
    }
  }, [googleDriveAccessToken.access_token, dialogRef])

  useEffect(() => {
    const validateTokenOnDialogOpen = async () => {
      const tokenString = localStorage.getItem('google_drive_access_token')
      if (tokenString) {
        const token = JSON.parse(tokenString)
        const isValid = await validateGoogleAccessToken({ data: { access_token: token.access_token } })
        if (!isValid.valid) {
          localStorage.removeItem('google_drive_access_token')
        }
      }
    }

    validateTokenOnDialogOpen()
  }, [dialogRef])

  return (
    <>
      <LoadingSpinner isLoading={embedFilesIsPending || googleDriveFilesIsLoading} />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2">
          {!googleDriveAccessToken.access_token && (
            <Link
              className="btn btn-xs"
              to="/libraries/auth-google"
              search={{ redirectAfterAuth: currentLocationHref }}
            >
              {t('actions.signInWithGoogle')}
            </Link>
          )}
          {googleDriveAccessToken.access_token && (
            <button type="button" className="btn btn-primary btn-xs" onClick={handleSwitchAccount}>
              {t('actions.switchGoogleAccount')}
            </button>
          )}
          {googleDriveAccessToken.access_token && (
            <button
              type="button"
              disabled={!selectedFiles.length || embedFilesIsPending || noFreeUploads}
              className="btn btn-primary btn-xs"
              onClick={async () => {
                await handleEmbedFiles(selectedFiles)
              }}
            >
              Add {selectedFiles.length} files into the Library
            </button>
          )}
        </div>
        {googleDriveFilesData?.files && (
          <FilesTable
            files={googleDriveFilesData.files.map((file) => ({
              ...file,
              size: file.size || 0,
            }))}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
        )}
      </div>
    </>
  )
}
