import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { debounce } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CheckIcon } from '../../icons/check-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { GridViewIcon } from '../../icons/grid-view-icon'
import { ListViewIcon } from '../../icons/list-view-icon'
import { queryKeys } from '../../query-keys'
import { getProfileQueryOptions } from '../../server-functions/users'
import { GoogleAccessTokenSchema, validateGoogleAccessToken } from '../data-sources/login-google-server'
import { toastError, toastSuccess } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { GoogleDriveFile, GoogleFilesTable } from './google-files-table'
import { uploadGoogleDriveFiles } from './server-functions/upload-google-drive-files'

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
      modifiedTime: z.string().optional(),
    }),
  ),
  nextPageToken: z.string().optional(),
})

const PAGE_SIZE = 50

export const getHighResIconUrl = (iconLink: string): string => {
  if (!iconLink) return ''

  const listIconPattern = /\/icon_\d+_([^_]+)_list\.png$/
  const resolutionPattern = /\/\d+\//

  if (listIconPattern.test(iconLink)) {
    return iconLink.replace(listIconPattern, '/mediatype/icon_3_$1_x32.png')
  }

  return resolutionPattern.test(iconLink) ? iconLink.replace(resolutionPattern, '/32/') : iconLink
}

interface FolderPath {
  id: string
  name: string
}

export const GoogleDriveFiles = ({ libraryId, disabled, dialogRef }: GoogleDriveFilesProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const rawToken =
    typeof localStorage === 'undefined' ? '{}' : localStorage?.getItem('google_drive_access_token') || '{}'
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(rawToken))
  const currentLocationHref = typeof window !== 'undefined' ? window.location.href : ''

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([])
  const selectedIds = useMemo(() => new Set(selectedFiles.map((f) => f.id)), [selectedFiles])

  // Search state with debounced setter
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSetSearchQuery = useMemo(() => debounce(setSearchQuery, 300), [])

  // Pagination state
  const [pageToken, setPageToken] = useState<string | undefined>(undefined)
  const [pageTokenHistory, setPageTokenHistory] = useState<string[]>([]) // For going back

  // Folder navigation state
  const rootFolder: FolderPath = { id: 'root', name: t('googleDriveRootFolder') }
  const [folderPath, setFolderPath] = useState<FolderPath[]>([rootFolder])
  const currentFolderId = folderPath[folderPath.length - 1].id

  // Reset folder path and pagination when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        setFolderPath([rootFolder])
      }
      // Always reset pagination when search changes
      setPageToken(undefined)
      setPageTokenHistory([])
    }, 0)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Build Google Drive API URL
  const googleDriveApiUrl = useMemo(() => {
    const baseUrl = 'https://www.googleapis.com/drive/v3/files'
    const fields = 'nextPageToken,files(id,name,size,iconLink,mimeType,modifiedTime)'
    const params = new URLSearchParams({
      fields,
      pageSize: PAGE_SIZE.toString(),
      // Sort folders first, then by name alphabetically
      orderBy: 'folder,name',
    })

    // Add page token if we're on a subsequent page
    if (pageToken) {
      params.set('pageToken', pageToken)
    }

    const queryConditions: string[] = ['trashed=false']

    if (searchQuery.trim()) {
      // When searching, search across all files
      const escapedSearch = searchQuery.replace(/'/g, "\\'")
      queryConditions.push(`name contains '${escapedSearch}'`)
    } else {
      // When not searching, show files in current folder
      queryConditions.push(`'${currentFolderId}' in parents`)
    }

    params.set('q', queryConditions.join(' and '))
    return `${baseUrl}?${params.toString()}`
  }, [searchQuery, currentFolderId, pageToken])

  // Fetch files
  const { data: googleDriveData, isLoading: googleDriveFilesIsLoading } = useQuery({
    queryKey: [queryKeys.GoogleDriveFiles, googleDriveAccessToken.access_token, googleDriveApiUrl],
    enabled: !!googleDriveAccessToken?.access_token,
    queryFn: async () => {
      const response = await fetch(googleDriveApiUrl, {
        headers: { Authorization: `Bearer ${googleDriveAccessToken.access_token}` },
      })
      const responseJson = googleDriveResponseSchema.parse(await response.json())
      return {
        files: responseJson.files.map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size ? parseInt(file.size) : 0,
          iconLink: getHighResIconUrl(file.iconLink ?? ''),
          mimeType: file.mimeType,
          modifiedTime: file.modifiedTime,
        })),
        nextPageToken: responseJson.nextPageToken,
      }
    },
  })

  const googleDriveFilesData = googleDriveData?.files
  const nextPageToken = googleDriveData?.nextPageToken

  // Upload files mutation
  const { mutate: uploadFilesMutation, isPending: uploadFilesIsPending } = useMutation({
    mutationFn: (data: { libraryId: string; files: GoogleDriveFile[]; access_token: string }) =>
      uploadGoogleDriveFiles({ data }),
    onSuccess: () => {
      toastSuccess(t('libraries.filesEmbeddedSuccess'))
      setSelectedFiles([])
      queryClient.invalidateQueries({ queryKey: ['AiLibraryFiles', { libraryId }] })
      queryClient.invalidateQueries({ queryKey: getProfileQueryOptions() })
      dialogRef.current?.close()
    },
    onError: (error) => {
      toastError(`${t('libraries.filesEmbeddedError')}: ${error.message}`)
    },
  })

  // Auto-open dialog after OAuth redirect
  useEffect(() => {
    if (googleDriveAccessToken?.access_token && localStorage.getItem('google_drive_dialog_open') === 'true') {
      dialogRef.current?.showModal()
      localStorage.removeItem('google_drive_dialog_open')
    }
  }, [googleDriveAccessToken?.access_token, dialogRef])

  // Validate token on mount
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

  // Handlers
  const handleSwitchAccount = () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
    localStorage.removeItem('google_drive_access_token')
    window.location.href = `/libraries/auth-google?prompt=select_account&redirectAfterAuth=${encodeURIComponent(window.location.href)}`
  }

  const handleUploadFiles = () => {
    uploadFilesMutation({
      libraryId,
      files: selectedFiles,
      access_token: googleDriveAccessToken.access_token!,
    })
  }

  const handleToggleFile = useCallback((file: GoogleDriveFile) => {
    setSelectedFiles((prev) =>
      prev.some((f) => f.id === file.id) ? prev.filter((f) => f.id !== file.id) : [...prev, file],
    )
  }, [])

  const handleOpenFolder = useCallback((id: string, name: string) => {
    setFolderPath((prev) => [...prev, { id, name }])
    // Reset pagination when entering a folder
    setPageToken(undefined)
    setPageTokenHistory([])
  }, [])

  const handleNavigateToFolder = (folderId: string) => {
    const index = folderPath.findIndex((f) => f.id === folderId)
    if (index !== -1) {
      setFolderPath(folderPath.slice(0, index + 1))
      // Reset pagination when navigating via breadcrumb
      setPageToken(undefined)
      setPageTokenHistory([])
    }
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (nextPageToken) {
      setPageTokenHistory((prev) => [...prev, pageToken || ''])
      setPageToken(nextPageToken)
    }
  }

  const handlePreviousPage = () => {
    if (pageTokenHistory.length > 0) {
      const newHistory = [...pageTokenHistory]
      const previousToken = newHistory.pop()
      setPageTokenHistory(newHistory)
      setPageToken(previousToken || undefined)
    }
  }

  const currentPage = pageTokenHistory.length + 1
  const hasNextPage = !!nextPageToken
  const hasPreviousPage = pageTokenHistory.length > 0

  const getAddFilesLabel = (count: number) => {
    return count === 1 ? t('libraries.addSingleFile') : t('libraries.addMultipleFiles', { count })
  }

  const getSelectedFilesLabel = (count: number) => {
    return count === 1 ? t('libraries.selectedSingleFile') : t('libraries.selectedMultipleFiles', { count })
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="flex h-full flex-col">
      <LoadingSpinner isLoading={uploadFilesIsPending || googleDriveFilesIsLoading} />

      {/* Header */}
      <div className="bg-base-100 sticky top-0 z-20 flex flex-col gap-2 p-2 shadow-md">
        {!googleDriveAccessToken?.access_token ? (
          <Link
            className="btn btn-primary btn-sm"
            to="/libraries/auth-google"
            search={{ redirectAfterAuth: currentLocationHref }}
          >
            {t('actions.signInWithGoogle')}
          </Link>
        ) : (
          <>
            {/* Row 1: Search and actions */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                className="input input-bordered input-sm min-w-0 flex-1"
                placeholder={t('libraries.searchGoogleDrive')}
                onChange={(e) => debouncedSetSearchQuery(e.target.value)}
              />
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleSwitchAccount}>
                {t('actions.switchGoogleAccount')}
              </button>
              <button
                type="button"
                disabled={!selectedFiles.length || uploadFilesIsPending || disabled}
                className="btn btn-primary btn-sm"
                onClick={handleUploadFiles}
              >
                {getAddFilesLabel(selectedFiles.length)}
              </button>
            </div>

            {/* Row 2: Selection, breadcrumbs, view toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Selection count */}
              <div className="border-base-300 bg-base-200 inline-flex h-8 items-center gap-1 rounded-full border px-2">
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="hover:bg-base-300 flex items-center justify-center rounded-full p-1"
                  disabled={selectedFiles.length === 0}
                >
                  <CrossIcon className="h-4 w-4" />
                </button>
                <span className="text-sm">{getSelectedFilesLabel(selectedFiles.length)}</span>
              </div>

              {/* Breadcrumbs - only show when not searching */}
              {!isSearching && (
                <div className="breadcrumbs flex-1 text-sm">
                  <ul className="flex-wrap">
                    {folderPath.map((folder) => (
                      <li key={folder.id}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleNavigateToFolder(folder.id)}
                        >
                          {folder.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Search indicator */}
              {isSearching && (
                <div className="text-base-content/60 flex-1 text-center text-sm">
                  {t('libraries.searchingAllFiles')}
                </div>
              )}

              {/* View toggle */}
              <div className="border-base-300 bg-base-200 inline-flex h-8 items-center rounded-full border">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex h-full w-10 items-center justify-center rounded-l-full ${
                    viewMode === 'grid' ? 'bg-base-300' : ''
                  }`}
                >
                  {viewMode === 'grid' && <CheckIcon className="mr-0.5 h-3 w-3" />}
                  <GridViewIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex h-full w-10 items-center justify-center rounded-r-full ${
                    viewMode === 'list' ? 'bg-base-300' : ''
                  }`}
                >
                  {viewMode === 'list' && <CheckIcon className="mr-0.5 h-3 w-3" />}
                  <ListViewIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {googleDriveFilesData && googleDriveFilesData.length > 0 ? (
          <GoogleFilesTable
            files={googleDriveFilesData}
            selectedIds={selectedIds}
            viewMode={viewMode}
            onToggleFile={handleToggleFile}
            onOpenFolder={handleOpenFolder}
          />
        ) : (
          !googleDriveFilesIsLoading && (
            <div className="flex h-full items-center justify-center text-gray-500">
              {isSearching ? t('libraries.noFilesFoundSearch') : t('libraries.noFilesInFolder')}
            </div>
          )
        )}
      </div>

      {/* Pagination - only show when there are pages to navigate */}
      {(hasPreviousPage || hasNextPage) && (
        <div className="bg-base-100 border-base-300 flex items-center justify-between border-t p-2">
          <span className="text-sm text-gray-500">
            {t('labels.page')} {currentPage}
          </span>
          <div className="join">
            <button
              type="button"
              className="btn btn-sm join-item"
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage || googleDriveFilesIsLoading}
            >
              «
            </button>
            <button
              type="button"
              className="btn btn-sm join-item"
              onClick={handleNextPage}
              disabled={!hasNextPage || googleDriveFilesIsLoading}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
