import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { getMimeTypeFromFileName } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest, backendUpload } from '../../server-functions/backend'
import { getProfileQueryOptions } from '../../server-functions/users'
import { GoogleAccessTokenSchema, validateGoogleAccessToken } from '../data-sources/login-google-server'
import { toastError, toastSuccess } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { LibraryFile, LibraryFileSchema } from './files/file-schema'
import { GoogleFilesTable } from './google-files-table'

export interface GoogleDriveFilesProps {
  libraryId: string
  disabled: boolean
  dialogRef: React.RefObject<HTMLDialogElement | null>
}

export const googleDriveResponseSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.string().optional(),
      iconLink: z.string().optional(),
      mimeType: z.string(),
    }),
  ),
})

export const getHighResIconUrl = (iconLink: string): string => {
  if (!iconLink) return ''

  const listIconPattern = /\/icon_\d+_([^_]+)_list\.png$/
  const resolutionPattern = /\/\d+\//

  if (listIconPattern.test(iconLink)) {
    return iconLink.replace(listIconPattern, '/mediatype/icon_3_$1_x32.png')
  }

  return resolutionPattern.test(iconLink) ? iconLink.replace(resolutionPattern, '/32/') : iconLink
}

const embedFiles = createServerFn({ method: 'GET' })
  .inputValidator((data: { libraryId: string; files: Array<LibraryFile>; access_token: string }) =>
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

      const response = await backendRequest(
        graphql(`
          mutation prepareFile($file: AiLibraryFileInput!) {
            prepareFileUpload(data: $file) {
              id
            }
          }
        `),
        {
          file: {
            name: file.name,
            originUri: `https://drive.google.com/file/d/${file.id}/view`,
            mimeType: isPdfExport ? 'application/pdf' : getMimeTypeFromFileName(file.name),
            libraryId: ctx.data.libraryId,
          },
        },
      )

      const uploadResponse = await backendUpload(blob, response.prepareFileUpload.id)

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      return await backendRequest(
        graphql(`
          mutation processFile($fileId: String!) {
            createContentProcessingTask(fileId: $fileId) {
              id
            }
          }
        `),
        {
          fileId: response.prepareFileUpload.id,
        },
      )
    })

    const results = await Promise.allSettled(processFiles)
    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => (result as PromiseRejectedResult).reason)
    if (errors.length > 0) {
      throw new Error(`Failed to process some files:\n${errors.join('\n')}`)
    }
  })

export const GoogleDriveFiles = ({ libraryId, disabled, dialogRef }: GoogleDriveFilesProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const rawToken =
    typeof localStorage === 'undefined' ? '{}' : localStorage?.getItem('google_drive_access_token') || '{}'
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(rawToken))
  const currentLocationHref = typeof window !== 'undefined' ? window.location.href : ''
  // used as condition for rendering the files table
  const { data: googleDriveFilesData, isLoading: googleDriveFilesIsLoading } = useQuery({
    queryKey: [queryKeys.GoogleDriveFiles, googleDriveAccessToken.access_token],
    enabled: !!googleDriveAccessToken?.access_token,
    queryFn: async () => {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?fields=files(id,name,size,iconLink,mimeType)`,
        {
          headers: { Authorization: `Bearer ${googleDriveAccessToken.access_token}` },
        },
      )
      const responseJson = googleDriveResponseSchema.parse(await response.json())
      return responseJson.files.map(({ ...file }) => ({
        ...file,
        size: file.size ? parseInt(file.size) : 0,
        iconLink: getHighResIconUrl(file.iconLink ?? ''),
      }))
    },
  })

  const [selectedFiles, setSelectedFiles] = useState<LibraryFile[]>([])
  const { mutate: embedFilesMutation, isPending: embedFilesIsPending } = useMutation({
    mutationFn: (data: { libraryId: string; files: LibraryFile[]; access_token: string }) => embedFiles({ data }),
    onSuccess: () => {
      toastSuccess('Files embedded successfully')
      setSelectedFiles([])
      queryClient.invalidateQueries({ queryKey: [queryKeys.AiLibraryFiles, libraryId] })
      queryClient.invalidateQueries({ queryKey: getProfileQueryOptions() })
    },
    onError: (error) => {
      toastError(`Error embedding files: ${error.message}`)
    },
  })

  useEffect(() => {
    if (googleDriveAccessToken?.access_token && localStorage.getItem('google_drive_dialog_open') === 'true') {
      dialogRef.current?.showModal()
      localStorage.removeItem('google_drive_dialog_open')
    }
  }, [googleDriveAccessToken?.access_token, dialogRef])

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

  const handleSwitchAccount = () => {
    if (typeof window === 'undefined') return
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem('google_drive_access_token')
    window.location.href = `/libraries/auth-google?prompt=select_account&redirectAfterAuth=${encodeURIComponent(
      window.location.href,
    )}`
  }

  const handleEmbedFiles = async (files: LibraryFile[]) => {
    embedFilesMutation({
      libraryId,
      files,
      access_token: googleDriveAccessToken.access_token!,
    })
  }

  const getAddFilesLabel = (count: number) => {
    return count === 1 ? t('libraries.addSingleFile') : t('libraries.addMultipleFiles', { count })
  }

  return (
    <>
      <LoadingSpinner isLoading={embedFilesIsPending || googleDriveFilesIsLoading} />
      <div className="flex flex-col gap-2">
        <div className="bg-base-100 sticky top-0 z-20 flex justify-between gap-2 p-1 shadow-md">
          {!googleDriveAccessToken?.access_token ? (
            <Link
              className="btn btn-xs"
              to="/libraries/auth-google"
              search={{ redirectAfterAuth: currentLocationHref }}
            >
              {t('actions.signInWithGoogle')}
            </Link>
          ) : (
            <>
              <button type="button" className="btn btn-primary btn-xs" onClick={handleSwitchAccount}>
                {t('actions.switchGoogleAccount')}
              </button>
              <button
                type="button"
                disabled={!selectedFiles.length || embedFilesIsPending || disabled}
                className="btn btn-primary btn-xs"
                onClick={() => handleEmbedFiles(selectedFiles)}
              >
                {getAddFilesLabel(selectedFiles.length)}
              </button>
            </>
          )}
        </div>
        {googleDriveFilesData && googleDriveFilesData.length > 0 && (
          <GoogleFilesTable selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        )}
      </div>
    </>
  )
}
