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
  files: Array<{ id: string; kind: string; name: string; size?: number; iconLink?: string }>
}

function getHighResIconUrl(iconLink: string): string {
  if (!iconLink) return iconLink

  if (/\/icon_\d+_[^_]+_list\.png$/.test(iconLink)) {
    return iconLink.replace(/\/icon_\d+_([^_]+)_list\.png$/, '/mediatype/icon_3_$1_x32.png')
  }

  return iconLink.replace(/\/(\d+)\//, '/32/')
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
        throw new Error(`Failed to prepare file ${file.id}`)
      }

      const upload = await backendUpload(blob, preparedFile.prepareFile.id)
      if (!upload.ok) {
        throw new Error(`Failed to upload file ${file.id}`)
      }

      return backendRequest(ProcessFileDocument, { fileId: preparedFile.prepareFile.id })
    })

    const results = await Promise.allSettled(processFiles)
    const errs = results
      .filter((results): results is PromiseRejectedResult => results.status === 'rejected')
      .map((results) => results.reason)
    if (errs.length) {
      throw new Error(`Some files failed: ${errs.map(String).join(', ')}`)
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
  const rawToken = localStorage.getItem('google_drive_access_token') || '{}'
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(rawToken))

  const { data: googleDriveFilesData, isLoading } = useQuery({
    queryKey: [queryKeys.GoogleDriveFiles, googleDriveAccessToken.access_token],
    enabled: Boolean(googleDriveAccessToken.access_token),
    queryFn: async () => {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,size,iconLink)`,
        {
          headers: { Authorization: `Bearer ${googleDriveAccessToken.access_token}` },
        },
      )
      const json = (await response.json()) as GoogleDriveResponse
      return json.files.map((f) => ({
        ...f,
        size: f.size ?? 0,
        iconLink: getHighResIconUrl(f.iconLink ?? ''),
      }))
    },
  })

  const [selectedFiles, setSelectedFiles] = useState<LibraryFile[]>([])
  const { mutate, isPending } = useMutation({
    mutationFn: (data: { libraryId: string; files: LibraryFile[]; access_token: string }) => embedFiles({ data: data }),
    onSuccess: () => {
      toastSuccess('Files embedded successfully')
      setSelectedFiles([])
      queryClient.invalidateQueries({ queryKey: [queryKeys.AiLibraryFiles, libraryId] })
      queryClient.invalidateQueries({ queryKey: getProfileQueryOptions(userId).queryKey })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      toastError(`Error embedding files: ${msg}`)
    },
  })

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
        const { access_token } = JSON.parse(tokenString)
        const isValid = await validateGoogleAccessToken({ data: { access_token } })
        if (!isValid.valid) {
          localStorage.removeItem('google_drive_access_token')
        }
      }
    }
    validateTokenOnDialogOpen()
  }, [dialogRef])

  return (
    <>
      <LoadingSpinner isLoading={isPending || isLoading} />
      <div className="flex flex-col gap-2">
        <div className="sticky top-0 z-20 flex justify-between gap-2 bg-base-100 p-1 shadow-md">
          {!googleDriveAccessToken.access_token ? (
            <Link
              className="btn btn-xs"
              to="/libraries/auth-google"
              search={{ redirectAfterAuth: currentLocationHref }}
            >
              {t('actions.signInWithGoogle')}
            </Link>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary btn-xs"
                onClick={() => {
                  localStorage.removeItem('google_drive_access_token')
                  window.location.href = `/libraries/auth-google?prompt=select_account&redirectAfterAuth=${encodeURIComponent(
                    window.location.href,
                  )}`
                }}
              >
                {t('actions.switchGoogleAccount')}
              </button>
              <button
                type="button"
                disabled={!selectedFiles.length || isPending || noFreeUploads}
                className="btn btn-primary btn-xs"
                onClick={() =>
                  mutate({ libraryId, files: selectedFiles, access_token: googleDriveAccessToken.access_token! })
                }
              >
                {t('libraries.addFiles', { count: selectedFiles.length })}
              </button>
            </>
          )}
        </div>
        {googleDriveFilesData && googleDriveFilesData.length > 0 && (
          <FilesTable files={googleDriveFilesData} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        )}
      </div>
    </>
  )
}
