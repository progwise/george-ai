import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CheckIcon } from '../../icons/check-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { FileIcon } from '../../icons/file-icon'
import { FolderIcon } from '../../icons/folder-icon'
import { GridViewIcon } from '../../icons/grid-view-icon'
import { ListViewIcon } from '../../icons/list-view-icon'
import { fetchContentOfOpenGoogleDriveFolder } from './google-drive-folder-content'

const clickDelay = 250

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  size: z.number().optional(),
  iconLink: z.string().optional(),
})
export type LibraryFile = z.infer<typeof LibraryFileSchema>

interface GoogleFilesTableProps {
  checkedFileIds: string[]
  setCheckedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
  checkedFolders: { id: string; path: string[] }[]
  setCheckedFolders: React.Dispatch<React.SetStateAction<{ id: string; path: string[] }[]>>
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const kilobytes = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const kilobyteExponent = Math.floor(Math.log(bytes) / Math.log(kilobytes))
  return parseFloat((bytes / Math.pow(kilobytes, kilobyteExponent)).toFixed(2)) + ' ' + sizes[kilobyteExponent]
}

export const GoogleFilesTable = ({
  checkedFileIds,
  setCheckedFiles,
  checkedFolders,
  setCheckedFolders,
}: GoogleFilesTableProps) => {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const rootFolder: { id: string; name: string } = { id: 'root', name: 'root' }

  const [clickCount, setClickCount] = useState<number>(0)
  const [clickTarget, setClickTarget] = useState<LibraryFile | null>(null)
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isBrowsingCheckedFolder, setIsBrowsingCheckedFolder] = useState<boolean>(false)
  const isBrowsingCheckedFolderRef = useRef(isBrowsingCheckedFolder)
  const [idOfCheckedParentFolder, setIdOfCheckedParentFolder] = useState<string | null>(null)

  const [displayedFiles, setDisplayedFiles] = useState<
    { size: number; iconLink: string; kind: string; id: string; name: string }[] | null
  >(null)

  // Changing the query and the path at the same time prevents inconsistency between the displayed files and the breadcrumb navigation.
  const [googleDriveFolder, setGoogleDriveFolder] = useState({
    fileQuery: () => encodeURIComponent("'root' in parents"),
    path: [rootFolder],
  })

  const fileQuery = googleDriveFolder.fileQuery()

  // is used for updating the view of the files which are contained in the current folder
  useQuery({
    queryKey: [fileQuery, setDisplayedFiles],
    queryFn: () => fetchContentOfOpenGoogleDriveFolder(fileQuery, setDisplayedFiles),
  })

  const toggleFile = useCallback(
    (file: LibraryFile) => {
      if (!isBrowsingCheckedFolder) {
        setCheckedFiles((prev) => {
          if (prev.some((item) => item.id === file.id)) {
            return prev.filter((fileItem) => fileItem.id !== file.id)
          }
          return [...prev, file]
        })
      }
    },
    [setCheckedFiles, isBrowsingCheckedFolder],
  )

  const toggleFolder = useCallback(
    async (file: LibraryFile) => {
      if (!isBrowsingCheckedFolder) {
        if (!checkedFolders.some((folder) => folder.id === file.id)) {
          // The path of folders is saved in order to enable removing child folders from checked folders
          setCheckedFolders((prev) => [
            ...prev,
            { id: file.id, path: googleDriveFolder.path.map((folder) => folder.id) },
          ])
        } else {
          setCheckedFolders((prev) => prev.filter((folder) => folder.id !== file.id))
          if (file.id === idOfCheckedParentFolder) {
            setIdOfCheckedParentFolder(null)
          }
        }
      }
    },
    [checkedFolders, setCheckedFolders, idOfCheckedParentFolder, googleDriveFolder.path, isBrowsingCheckedFolder],
  )

  useEffect(() => {
    isBrowsingCheckedFolderRef.current = isBrowsingCheckedFolder
  }, [isBrowsingCheckedFolder])

  // Ensures that a double click does not trigger the toggleFolder function.
  useEffect(() => {
    if (!clickTarget || clickCount === 0) {
      return
    }
    // The folder will be toggled only if the time period runs out while clickCount still has the value 1.
    clickTimeout.current = setTimeout(() => {
      if (clickCount === 1) {
        toggleFolder(clickTarget)
      }
      setClickCount(0)
    }, clickDelay)
    // clears the timeout within the cleanup function
    return () => {
      if (clickTimeout.current && clickTarget !== null) {
        clearTimeout(clickTimeout.current)
      }
    }
  }, [clickTarget, toggleFolder, clickCount])

  const handleClickOnFolder = (file: LibraryFile) => {
    setClickTarget(file) // handles two clicks as double click only when the same element is clicked again
    setClickCount((prev) => prev + 1)
    if (checkedFolders.some((folder) => folder.id === file.id)) {
      setIdOfCheckedParentFolder(file.id) // is used to keep track of when a selected folder is left
    }
  }

  const openFolder = (id: string, name: string) => {
    const clickedFolder = { id: id, name: name }
    setGoogleDriveFolder({
      fileQuery: () => encodeURIComponent("'" + id + "'" + ' in parents'),
      path: [...googleDriveFolder.path, clickedFolder],
    })
    if (id === idOfCheckedParentFolder) {
      setIsBrowsingCheckedFolder(true)
    }
  }

  const goToPreviousFolder = (id: string) => {
    if (id === 'root') {
      setGoogleDriveFolder({
        fileQuery: () => encodeURIComponent("'root' in parents"),
        path: [rootFolder],
      })
      setIsBrowsingCheckedFolder(false)
      return
    }
    let newPath = googleDriveFolder.path
    const newFolderIndex = googleDriveFolder.path.map((item) => item.id).indexOf(id)
    if (newPath.length - 1 > newFolderIndex) {
      newPath = newPath.slice(0, newFolderIndex + 1)
    }
    if (!newPath.some((folder) => folder.id === idOfCheckedParentFolder)) {
      setIsBrowsingCheckedFolder(false)
    }
    setGoogleDriveFolder({
      fileQuery: () => encodeURIComponent("'" + id + "'" + ' in parents'),
      path: newPath,
    })
  }

  const unselectFilesAndFolders = () => {
    setCheckedFiles([])
    setCheckedFolders([])
  }

  const isFileOrFolderChecked = checkedFileIds.length > 0 || checkedFolders.length > 0

  return (
    <div>
      {/* Desktop view of control elements */}
      <div className="bg-base-100 sticky top-[36px] z-10 hidden w-full flex-col p-1 shadow-md md:flex md:flex-row md:items-center md:justify-between">
        <label
          className={
            (isFileOrFolderChecked ? 'btn hover:bg-base-400' : '') +
            'border-base-300 bg-base-800 inline-flex h-8 w-auto items-center gap-1 rounded-full border-2 p-2'
          }
        >
          <input
            type="button"
            onClick={() => unselectFilesAndFolders()}
            className="bg-base-300 flex items-center justify-center rounded-full focus:outline-none"
            disabled={!isFileOrFolderChecked}
          />
          <CrossIcon />
          <span className="text-base-content pe-2 text-sm font-medium">{t('googleDriveUnselectFiles')}</span>
        </label>
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
          <label
            className={
              (isFileOrFolderChecked ? 'btn hover:bg-base-400 ' : '') +
              'border-base-300 bg-base-200 order-1 inline-flex h-8 w-auto items-center gap-1 rounded-full border-2 p-2'
            }
          >
            <input
              type="button"
              onClick={() => unselectFilesAndFolders()}
              className="bg-base-300 flex items-center justify-center rounded-full focus:outline-none"
              disabled={!isFileOrFolderChecked}
            />
            <CrossIcon />
            <span className="text-base-content text-sm font-medium">{t('googleDriveUnselectFiles')}</span>
          </label>
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
                const isChecked =
                  checkedFileIds.some((id) => id === file.id) || checkedFolders.some((folder) => folder.id === file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'application/vnd.google-apps.folder'
                const iconDesign = 'me-3 ms-3 flex-none size-6 w-auto h-auto'

                return (
                  <div
                    key={file.id}
                    className={
                      'flex touch-manipulation items-center gap-3 rounded border p-2 focus:outline-none ' +
                      (isBrowsingCheckedFolderRef.current || isChecked
                        ? 'bg-base-200 border-blue-500'
                        : 'hover:bg-base-100 border-transparent')
                    }
                  >
                    <div
                      onClick={() => (isFolder ? toggleFolder(file) : toggleFile(file))}
                      role="button"
                      tabIndex={0}
                      className="rounded-box flex-none select-none"
                      aria-pressed={isChecked}
                      aria-label={`File ${file.name}, ${isChecked ? 'selected' : 'not selected'}`}
                      title={`${file.name} (${formatBytes(sizeValue)})`}
                    >
                      {/* A ref object is used here in order to delay the change of checked status, since showing the content of an opened folder takes more time. */}
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs me-3 ms-3 flex-none"
                        checked={isBrowsingCheckedFolderRef.current || isChecked}
                        disabled={isBrowsingCheckedFolderRef.current ? true : false}
                        readOnly
                      />
                    </div>
                    <div
                      className={
                        isFolder
                          ? 'btn btn-ghost flex flex-1 gap-2 rounded-md p-2 ps-0 text-left'
                          : 'flex flex-1 items-center gap-2 p-2'
                      }
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
                const isSelected =
                  checkedFileIds.some((id) => id === file.id) || checkedFolders.some((folder) => folder.id === file.id)
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
                      if (event.key === 'Enter' || event.key === ' ') {
                        if (isFolder) {
                          toggleFolder(file)
                        } else {
                          toggleFile(file)
                        }
                      }
                    }}
                    className={`group relative flex cursor-pointer touch-manipulation select-none flex-col items-center justify-center rounded-lg border p-3 focus:outline-none ${
                      isSelected || isBrowsingCheckedFolder
                        ? 'bg-primary/20 border-primary'
                        : 'hover:bg-base-100 border-transparent'
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
