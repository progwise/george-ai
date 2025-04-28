import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { FileIconLarge } from '../../icons/file-icon-large'
import { GridViewIcon } from '../../icons/grid-view-icon'
import { ListViewIcon } from '../../icons/list-view-icon'

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  size: z.number().optional(),
})
export type LibraryFile = z.infer<typeof LibraryFileSchema>

export interface FilesTableProps {
  files: LibraryFile[]
  selectedFiles: LibraryFile[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getDefaultView = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(min-width: 1024px)').matches ? 'grid' : 'list'
  }
  return 'grid'
}

export const FilesTable: React.FC<FilesTableProps> = React.memo(({ files, selectedFiles, setSelectedFiles }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(getDefaultView)
  const selectedIds = useMemo(() => new Set(selectedFiles.map((f) => f.id)), [selectedFiles])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const listener = (e: MediaQueryListEvent) => setViewMode(e.matches ? 'grid' : 'list')
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  const toggleFile = useCallback(
    (file: LibraryFile) => {
      const isSelected = selectedIds.has(file.id)
      setSelectedFiles((prev) => (isSelected ? prev.filter((f) => f.id !== file.id) : [...prev, file]))
    },
    [selectedIds, setSelectedFiles],
  )

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-end p-2">
        <div className="inline-flex rounded-full border-2 border-gray-200 bg-gray-200 dark:border-gray-600 dark:bg-gray-700">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`group inline-flex items-center rounded-l-full px-4 py-2 transition-colors duration-300 ease-in focus:outline-none ${
              viewMode === 'grid' ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
          >
            <GridViewIcon className="h-4 w-4 fill-current text-gray-700 dark:text-gray-300" />
            <span className="ml-1 hidden text-xs text-gray-700 lg:group-hover:inline-block dark:text-gray-300">
              Grid
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`group inline-flex items-center rounded-r-full px-4 py-2 transition-colors duration-300 ease-in focus:outline-none ${
              viewMode === 'list' ? 'bg-gray-300 dark:bg-gray-600' : ''
            }`}
          >
            <ListViewIcon className="h-4 w-4 fill-current text-gray-700 dark:text-gray-300" />
            <span className="ml-1 hidden text-xs text-gray-700 lg:group-hover:inline-block dark:text-gray-300">
              List
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="flex flex-col gap-2 p-2">
          {files.map((file, idx) => {
            const isSelected = selectedIds.has(file.id)
            const sizeValue = file.size ?? 0
            return (
              <div
                key={file.id}
                onClick={() => toggleFile(file)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleFile(file)
                }}
                className={
                  'flex select-none items-center gap-3 rounded border p-2 focus:outline-none ' +
                  (isSelected ? 'border-blue-500 bg-base-200' : 'border-transparent hover:bg-base-100')
                }
                aria-pressed={isSelected}
                aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
                title={`${file.name} (${formatBytes(sizeValue)})`}
              >
                <input type="checkbox" className="checkbox checkbox-xs" checked={isSelected} readOnly />
                <FileIconLarge className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                <div className="flex-1 truncate text-sm">
                  {idx + 1}. {file.name}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {files.map((file) => {
            const isSelected = selectedIds.has(file.id)
            const sizeValue = file.size ?? 0
            return (
              <div
                key={file.id}
                onClick={() => toggleFile(file)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleFile(file)
                }}
                className={
                  'group relative flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border p-3 focus:outline-none ' +
                  (isSelected ? 'border-blue-500 bg-base-200' : 'border-transparent hover:bg-base-100')
                }
                aria-pressed={isSelected}
                aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
              >
                <FileIconLarge className="mb-2 h-10 w-10 text-gray-700 dark:text-gray-300" />
                <span className="block w-full truncate text-center text-sm" title={file.name}>
                  {file.name}
                </span>
                <span className="mt-1 hidden text-xs text-gray-600 md:block">{formatBytes(sizeValue)}</span>

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100/90 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="break-words text-xs font-medium">{file.name}</p>
                  <p className="text-xs">{formatBytes(sizeValue)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})
FilesTable.displayName = 'FilesTable'
