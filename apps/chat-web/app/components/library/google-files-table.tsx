import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CheckIcon } from '../../icons/check-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { FileIcon } from '../../icons/file-icon'
import { FolderIcon } from '../../icons/folder-icon'
import { GridViewIcon } from '../../icons/grid-view-icon'
import { ListViewIcon } from '../../icons/list-view-icon'
import { queryKeys } from '../../query-keys'
import { GoogleAccessTokenSchema } from '../data-sources/login-google-server'
import { getHighResIconUrl, googleDriveResponseSchema } from './google-drive-files'

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  size: z.number().optional(),
  iconLink: z.string().optional(),
})
export type LibraryFile = z.infer<typeof LibraryFileSchema>

export interface GoogleFilesTableProps {
  checkedFiles: LibraryFile[]
  setCheckedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
  checkedFolderIds: string[]
  setCheckedFolderIds: React.Dispatch<React.SetStateAction<string[]>>
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const kilobytes = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const kilobyteExponent = Math.floor(Math.log(bytes) / Math.log(kilobytes))
  return parseFloat((bytes / Math.pow(kilobytes, kilobyteExponent)).toFixed(2)) + ' ' + sizes[kilobyteExponent]
}

export const GoogleFilesTable = ({
  checkedFiles,
  setCheckedFiles,
  checkedFolderIds,
  setCheckedFolderIds,
}: GoogleFilesTableProps) => {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const checkedFileIds = useMemo(() => new Set(checkedFiles.map((selectedFile) => selectedFile.id)), [checkedFiles])
  const rawToken = localStorage.getItem('google_drive_access_token') || '{}'
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(rawToken))
  const rootFolder: { id: string; name: string } = { id: 'root', name: 'root' }
  const queryClient = useQueryClient()

  const [clickCount, setClickCount] = useState<number>(0)
  const clickCountRef = useRef(clickCount)
  const clickDelay = 250
  const [clickTarget, setClickTarget] = useState<LibraryFile | null>(null)
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [clickTimeStamp, setClickTimeStamp] = useState<number>(0)
  const [numberOfRecursiveProcesses, setNumberOfRecursiveProcesses] = useState<number>(0)

  const [displayedFiles, setDisplayedFiles] = useState<
    { size: number; iconLink: string; kind: string; id: string; name: string }[] | null
  >(null)

  // changing the query and the path at the same time prevents inconsistency between the displayed files and the breadcrumb navigation
  const [googleDriveFolder, setGoogleDriveFolder] = useState({
    fileQuery: () => encodeURIComponent("'root' in parents"),
    path: [rootFolder],
  })

  const fetchDisplayedFiles = async () => {
    const fileQuery = googleDriveFolder.fileQuery()
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,size,iconLink,mimeType)&q=${fileQuery}`,
      {
        headers: { Authorization: `Bearer ${googleDriveAccessToken.access_token}` },
      },
    )
    if (!response.ok) throw new Error('Network error')
    const responseJson = googleDriveResponseSchema.parse(await response.json())
    const files = responseJson.files.map(({ mimeType, ...file }) => ({
      ...file,
      size: file.size ? parseInt(file.size) : 0,
      iconLink: getHighResIconUrl(file.iconLink ?? ''),
      kind: mimeType,
    }))
    setDisplayedFiles(files)
    return files
  }

  useQuery({
    queryKey: [googleDriveFolder, queryKeys.GoogleDriveFiles, googleDriveAccessToken.access_token],
    queryFn: fetchDisplayedFiles,
  })

  const getFolderContent = useCallback(
    async (query: string | null) => {
      const data = await queryClient.fetchQuery({
        queryKey: [query, googleDriveAccessToken, checkedFileIds, checkedFolderIds],
        queryFn: async () => {
          let fileQuery = ''
          if (query === null) {
            return null
          } else {
            fileQuery = query
          }
          const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,size,iconLink,mimeType)&q=${fileQuery}`,
            {
              headers: { Authorization: `Bearer ${googleDriveAccessToken.access_token}` },
            },
          )
          if (!response.ok) throw new Error('Network error')
          const responseJson = googleDriveResponseSchema.parse(await response.json())
          return responseJson.files.map(({ mimeType, ...file }) => ({
            ...file,
            size: file.size ? parseInt(file.size) : 0,
            iconLink: getHighResIconUrl(file.iconLink ?? ''),
            kind: mimeType,
          }))
        },
      })
      return data
    },
    [googleDriveAccessToken, queryClient, checkedFileIds, checkedFolderIds],
  )

  const toggleFile = useCallback(
    (file: LibraryFile) => {
      const isChecked = checkedFileIds.has(file.id)
      setCheckedFiles((prev) => (isChecked ? prev.filter((fileItem) => fileItem.id !== file.id) : [...prev, file]))
    },
    [checkedFileIds, setCheckedFiles],
  )

  const unselectFolder = useCallback(
    async (file: LibraryFile) => {
      setNumberOfRecursiveProcesses((prev) => prev + 1)
      const content = await getFolderContent(encodeURIComponent("'" + file.id + "'" + ' in parents'))
      const files = content?.filter((file) => file.kind !== 'application/vnd.google-apps.folder')
      files?.forEach((file) => {
        if (checkedFileIds.has(file.id)) {
          toggleFile(file)
        }
      })
      const folders = content?.filter((file) => file.kind === 'application/vnd.google-apps.folder')
      folders?.forEach((folder) => {
        unselectFolder(folder)
      })
      setCheckedFolderIds((prev) => prev.filter((id) => id !== file.id))
      setNumberOfRecursiveProcesses((prev) => prev - 1)
    },
    [getFolderContent, checkedFileIds, toggleFile, setCheckedFolderIds],
  )

  const selectFolder = useCallback(
    async (file: LibraryFile) => {
      setNumberOfRecursiveProcesses((prev) => prev + 1)
      if (!checkedFolderIds.some((id) => id === file.id)) {
        const content = await getFolderContent(encodeURIComponent("'" + file.id + "'" + ' in parents'))
        const files = content?.filter((file) => file.kind !== 'application/vnd.google-apps.folder')
        files?.forEach((file) => {
          if (!checkedFileIds.has(file.id)) {
            toggleFile(file)
          }
        })
        const folders = content?.filter((file) => file.kind === 'application/vnd.google-apps.folder')
        folders?.forEach((folder) => {
          selectFolder(folder)
        })
        setCheckedFolderIds((prev) => [...prev, file.id])
      }
      setNumberOfRecursiveProcesses((prev) => prev - 1)
    },
    [checkedFolderIds, getFolderContent, checkedFileIds, toggleFile, setCheckedFolderIds],
  )

  const toggleFolder = useCallback(
    async (file: LibraryFile) => {
      // Checking the number of ongoing function calls ensures that recursive function calls don't distort the results of other recursive function calls
      if (numberOfRecursiveProcesses === 0) {
        if (!checkedFolderIds.some((id) => id === file.id)) {
          selectFolder(file)
        } else {
          unselectFolder(file)
        }
      }
    },
    [checkedFolderIds, unselectFolder, numberOfRecursiveProcesses, selectFolder],
  )

  useEffect(() => {
    clickCountRef.current = clickCount
  }, [clickCount])

  // Ensures that a double click does not trigger the toggleFolder function.
  // Using a RefObject for the click counter instead of the actual variable prevents the timeout from being restarted immediately.
  useEffect(() => {
    if (!clickTarget || clickCountRef.current === 0) {
      return
    }
    clickTimeout.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        toggleFolder(clickTarget)
      }
      setClickCount(0)
    }, clickDelay)
    return () => {
      if (clickTimeout.current && clickTarget !== null) {
        clearTimeout(clickTimeout.current)
      }
    }
  }, [clickTarget, clickTimeStamp, toggleFolder])

  const handleClickOnFolder = (file: LibraryFile) => {
    setClickTarget(file) // handles two clicks as double click only when the same element is clicked again
    setClickCount((prev) => prev + 1)
    setClickTimeStamp(Date.now()) // Using a time stamp ensures that the second click triggers the click handling
  }

  const getSelectedFilesLabel = (count: number) => {
    return count === 1 ? t('libraries.selectedSingleFile') : t('libraries.selectedMultipleFiles', { count })
  }

  const openFolder = (id: string, name: string) => {
    const clickedFolder = { id: id, name: name }
    setGoogleDriveFolder({
      fileQuery: () => encodeURIComponent("'" + id + "'" + ' in parents'),
      path: [...googleDriveFolder.path, clickedFolder],
    })
  }

  const goToPreviousFolder = (id: string) => {
    if (id === 'root') {
      setGoogleDriveFolder({
        fileQuery: () => encodeURIComponent("'root' in parents"),
        path: [rootFolder],
      })
      return
    }
    let newPath = googleDriveFolder.path
    const newFolderIndex = googleDriveFolder.path.map((item) => item.id).indexOf(id)
    if (newPath.length - 1 > newFolderIndex) {
      newPath = newPath.slice(0, newFolderIndex + 1)
    }
    setGoogleDriveFolder({
      fileQuery: () => encodeURIComponent("'" + id + "'" + ' in parents'),
      path: newPath,
    })
  }

  return (
    <div>
      {/* Desktop view of control elements */}
      <div className="bg-base-100 sticky top-[36px] z-10 hidden w-full flex-col p-1 shadow-md md:flex md:flex-row md:items-center md:justify-between">
        <div className="border-base-300 bg-base-200 inline-flex h-8 w-auto items-center gap-1 rounded-full border-2 p-2">
          <button
            type="button"
            onClick={() => setCheckedFiles([])}
            className="hover:bg-base-400 bg-base-300 flex items-center justify-center rounded-full focus:outline-none"
            disabled={checkedFiles.length === 0}
          >
            <CrossIcon />
          </button>
          <span className="text-base-content text-sm font-medium">{getSelectedFilesLabel(checkedFiles.length)}</span>
        </div>
        <div className="breadcrumbs flex max-w-xl justify-center text-sm">
          <ul>
            {googleDriveFolder.path.map((folder) => {
              return (
                <li key={folder.id}>
                  <div className="flex gap-2">
                    <div>
                      {folder && (
                        <button
                          type="button"
                          className="btn btn-ghost rounded-4xl"
                          onClick={() => goToPreviousFolder(folder.id)}
                        >
                          {folder.id === 'root' ? t('googleDriveRootFolder') : folder.name}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="border-base-300 bg-base-200 inline-flex h-8 w-auto items-center rounded-full border-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`group inline-flex h-full w-12 items-center justify-center rounded-l-full transition-colors duration-300 ease-in focus:outline-none ${
              viewMode === 'grid' ? 'bg-base-300' : ''
            }`}
          >
            {viewMode === 'grid' && <CheckIcon className="text-base-content mr-1 flex items-center" />}
            <GridViewIcon className="text-base-content size-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`group inline-flex h-full w-12 items-center justify-center rounded-r-full transition-colors duration-300 ease-in focus:outline-none ${
              viewMode === 'list' ? 'bg-base-300' : ''
            }`}
          >
            {viewMode === 'list' && <CheckIcon className="text-base-content mr-1 flex items-center" />}
            <ListViewIcon className="text-base-content size-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Mobile view of control elements */}
      <div className="bg-base-100 sticky top-[36px] z-10 flex w-full flex-col p-1 shadow-md md:hidden">
        <div className="flex justify-between gap-4">
          <div className="border-base-300 bg-base-200 order-1 inline-flex h-8 w-auto items-center gap-1 rounded-full border-2 p-2">
            <button
              type="button"
              onClick={() => setCheckedFiles([])}
              className="hover:bg-base-400 bg-base-300 flex items-center justify-center rounded-full focus:outline-none"
              disabled={checkedFiles.length === 0}
            >
              <CrossIcon />
            </button>
            <span className="text-base-content text-sm font-medium">{getSelectedFilesLabel(checkedFiles.length)}</span>
          </div>
          <div className="border-base-300 bg-base-200 order-2 inline-flex h-8 w-auto items-center rounded-full border-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`group inline-flex h-full w-12 items-center justify-center rounded-l-full transition-colors duration-300 ease-in focus:outline-none ${
                viewMode === 'grid' ? 'bg-base-300' : ''
              }`}
            >
              {viewMode === 'grid' && <CheckIcon className="text-base-content mr-1 flex items-center" />}
              <GridViewIcon className="text-base-content size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`group inline-flex h-full w-12 items-center justify-center rounded-r-full transition-colors duration-300 ease-in focus:outline-none ${
                viewMode === 'list' ? 'bg-base-300' : ''
              }`}
            >
              {viewMode === 'list' && <CheckIcon className="text-base-content mr-1 flex items-center" />}
              <ListViewIcon className="text-base-content size-4 fill-current" />
            </button>
          </div>
        </div>

        <div className="breadcrumbs order-3 flex justify-center text-sm">
          <ul>
            {googleDriveFolder.path.map((folder) => {
              return (
                <li key={folder.id}>
                  <div className="flex gap-2">
                    <div>
                      {folder && (
                        <button
                          type="button"
                          className="btn btn-ghost rounded-4xl"
                          onClick={() => goToPreviousFolder(folder.id)}
                        >
                          {folder.id === 'root' ? t('googleDriveRootFolder') : folder.name}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Files and folders */}
      <div className="flex justify-center pt-4">
        <div className="w-full">
          {viewMode === 'list' && (
            <div className="flex flex-col gap-2 p-2">
              {displayedFiles?.map((file) => {
                const isSelected = checkedFileIds.has(file.id) || checkedFolderIds.some((id) => id === file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'application/vnd.google-apps.folder'
                const iconDesign = 'me-3 ms-3 flex-none size-6 w-auto h-auto'
                const contentDesign = isFolder
                  ? 'btn btn-ghost flex flex-1 text-left rounded-md p-2 ps-0 gap-2'
                  : 'flex flex-1 p-2 items-center gap-2'
                return (
                  <div
                    key={file.id}
                    className={
                      'flex items-center gap-3 rounded border p-2 focus:outline-none ' +
                      (isSelected ? 'bg-base-200 border-blue-500' : 'hover:bg-base-100 border-transparent')
                    }
                  >
                    <div
                      onClick={isFolder ? () => handleClickOnFolder(file) : () => toggleFile(file)}
                      role="button"
                      tabIndex={0}
                      className="rounded-box flex-none select-none"
                      aria-pressed={isSelected}
                      aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
                      title={`${file.name} (${formatBytes(sizeValue)})`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs me-3 ms-3 flex-none"
                        checked={isSelected}
                        readOnly
                      />
                    </div>
                    <div
                      className={contentDesign}
                      onClick={isFolder ? () => handleClickOnFolder(file) : () => toggleFile(file)}
                      onDoubleClick={isFolder ? () => openFolder(file.id, file.name) : undefined}
                    >
                      {file.iconLink ? (
                        <img src={file.iconLink} alt="" className={iconDesign + 'object-contain'} />
                      ) : isFolder ? (
                        <FolderIcon className={iconDesign} />
                      ) : (
                        <FileIcon className={iconDesign} />
                      )}
                      <div className="ms-4 flex flex-1 flex-col text-sm">
                        <div
                          className="break-words font-medium"
                          style={{
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                          }}
                        >
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isFolder ? t('folder') : t('file')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(sizeValue)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {displayedFiles?.map((file) => {
                const isSelected = checkedFileIds.has(file.id) || checkedFolderIds.some((id) => id === file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'application/vnd.google-apps.folder'
                return (
                  <div
                    key={file.id}
                    onClick={isFolder ? () => handleClickOnFolder(file) : () => toggleFile(file)}
                    onDoubleClick={isFolder ? () => openFolder(file.id, file.name) : undefined}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') toggleFile(file)
                    }}
                    className={`group relative flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border p-3 focus:outline-none ${
                      isSelected ? 'bg-primary/20 border-primary' : 'hover:bg-base-100 border-transparent'
                    }`}
                  >
                    {file.iconLink && (
                      <img src={file.iconLink} alt={`${file.name} icon`} className="size-12 object-contain" />
                    )}
                    <span className="text-base-content block w-full max-w-full truncate text-center text-sm">
                      {file.name}
                    </span>
                    <span className="text-base-content mt-1 text-xs">{isFolder ? t('folder') : t('file')}</span>
                    <span className="text-base-content mt-1 hidden text-xs md:block">{formatBytes(sizeValue)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
