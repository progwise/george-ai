import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
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
  selectedFiles: LibraryFile[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const kilobytes = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const kilobyteExponent = Math.floor(Math.log(bytes) / Math.log(kilobytes))
  return parseFloat((bytes / Math.pow(kilobytes, kilobyteExponent)).toFixed(2)) + ' ' + sizes[kilobyteExponent]
}

export const GoogleFilesTable = ({ selectedFiles, setSelectedFiles }: GoogleFilesTableProps) => {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const selectedIds = useMemo(() => new Set(selectedFiles.map((selectedFile) => selectedFile.id)), [selectedFiles])
  const rawToken = localStorage.getItem('google_drive_access_token') || '{}'
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(rawToken))
  const rootFolder: { id: string; name: string } = { id: 'root', name: 'root' }

  // changing the query and the path at the same time prevents inconsistency between the displayed files and the breadcrumb navigation
  const [googleDriveFolder, setGoogleDriveFolder] = useState({
    fileQuery: () => encodeURIComponent("'root' in parents"),
    path: [rootFolder],
  })

  const fetchFiles = async () => {
    const fileQuery = googleDriveFolder.fileQuery()
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
  }

  const { data } = useQuery({
    queryKey: [googleDriveFolder, queryKeys.GoogleDriveFiles, googleDriveAccessToken.access_token],
    queryFn: fetchFiles,
  })

  const toggleFile = useCallback(
    (file: LibraryFile) => {
      const isSelected = selectedIds.has(file.id)
      setSelectedFiles((prev) => (isSelected ? prev.filter((fileItem) => fileItem.id !== file.id) : [...prev, file]))
    },
    [selectedIds, setSelectedFiles],
  )

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
            onClick={() => setSelectedFiles([])}
            className="hover:bg-base-400 bg-base-300 flex items-center justify-center rounded-full focus:outline-none"
            disabled={selectedFiles.length === 0}
          >
            <CrossIcon />
          </button>
          <span className="text-base-content text-sm font-medium">{getSelectedFilesLabel(selectedFiles.length)}</span>
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
              onClick={() => setSelectedFiles([])}
              className="hover:bg-base-400 bg-base-300 flex items-center justify-center rounded-full focus:outline-none"
              disabled={selectedFiles.length === 0}
            >
              <CrossIcon />
            </button>
            <span className="text-base-content text-sm font-medium">{getSelectedFilesLabel(selectedFiles.length)}</span>
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
              {data?.map((file) => {
                const isSelected = selectedIds.has(file.id)
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
                      onClick={() => toggleFile(file)}
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
                      onClick={isFolder ? () => openFolder(file.id, file.name) : undefined}
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">{isFolder ? 'Folder' : 'File'}</div>
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
              {data?.map((file) => {
                const isSelected = selectedIds.has(file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'application/vnd.google-apps.folder'
                return (
                  <div
                    key={file.id}
                    onClick={isFolder ? () => openFolder(file.id, file.name) : () => toggleFile(file)}
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
                    <span className="text-base-content mt-1 text-xs">{isFolder ? 'Folder' : 'File'}</span>
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
