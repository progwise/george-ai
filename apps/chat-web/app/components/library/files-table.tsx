import { useCallback, useMemo, useState } from 'react'
import { z } from 'zod'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CheckIcon } from '../../icons/check-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { FolderIcon } from '../../icons/folder-icon'
import { GridViewIcon } from '../../icons/grid-view-icon'
import { ListViewIcon } from '../../icons/list-view-icon'

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  size: z.number().optional(),
  iconLink: z.string().optional(),
})
export type LibraryFile = z.infer<typeof LibraryFileSchema>

export interface FilesTableProps {
  files: LibraryFile[]
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

export const FilesTable = ({ files, selectedFiles, setSelectedFiles }: FilesTableProps) => {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const selectedIds = useMemo(() => new Set(selectedFiles.map((selectedFile) => selectedFile.id)), [selectedFiles])

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

  return (
    <div>
      <div className="bg-base-100 sticky top-[36px] z-10 flex items-center justify-between p-1 shadow-md">
        <div className="border-base-300 bg-base-200 inline-flex h-8 items-center gap-1 rounded-full border-2 p-2">
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
        <div className="border-base-300 bg-base-200 inline-flex h-8 items-center rounded-full border-2">
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

      <div className="flex justify-center p-4">
        <div className="w-full">
          {viewMode === 'list' && (
            <div className="flex flex-col gap-2 p-2">
              {files.map((file) => {
                const isSelected = selectedIds.has(file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'application/vnd.google-apps.folder'
                const iconDesign = isFolder ? 'mb-3 me-3 ms-3 flex-none' : 'invisible mb-4 me-3 ms-3 flex-none'

                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFile(file)}
                    role="button"
                    tabIndex={0}
                    className={
                      'flex select-none items-center gap-3 rounded border p-2 focus:outline-none ' +
                      (isSelected ? 'bg-base-200 border-blue-500' : 'hover:bg-base-100 border-transparent')
                    }
                    aria-pressed={isSelected}
                    aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
                    title={`${file.name} (${formatBytes(sizeValue)})`}
                  >
                    <input type="checkbox" className="checkbox checkbox-xs" checked={isSelected} readOnly />
                    <FolderIcon className={iconDesign} />
                    <div className="flex flex-1 flex-col text-sm">
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
                )
              })}
            </div>
          )}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {files.map((file) => {
                const isSelected = selectedIds.has(file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'application/vnd.google-apps.folder'
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFile(file)}
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
