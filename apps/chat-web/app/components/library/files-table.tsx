import React, { useCallback, useMemo, useState } from 'react'
import { useEffect } from 'react'
import { z } from 'zod'

import { CheckIcon } from '../../icons/check-icon'
import { CrossIcon } from '../../icons/cross-icon'
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
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getDefaultView = (): 'grid' | 'list' => {
  return 'list'
}

export const FilesTable: React.FC<FilesTableProps> = React.memo(({ files, selectedFiles, setSelectedFiles }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(getDefaultView)
  const selectedIds = useMemo(() => new Set(selectedFiles.map((f) => f.id)), [selectedFiles])

  useEffect(() => {
    // Remove the media query listener since view mode is fixed to 'grid'
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
      <div className="sticky top-[36px] z-10 flex items-center justify-between bg-base-100 p-1 shadow-md">
        <div>
          <div className="inline-flex h-8 items-center gap-1 rounded-full border-2 border-base-300 bg-base-200 p-2">
            <button
              type="button"
              onClick={() => setSelectedFiles([])}
              className="hover:bg-base-400 flex items-center justify-center rounded-full bg-base-300 focus:outline-none"
              aria-label="Clear selected files"
              disabled={selectedFiles.length === 0}
            >
              <CrossIcon />
            </button>
            <span className="text-sm font-medium text-base-content">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
        <div className="inline-flex h-8 items-center rounded-full border-2 border-base-300 bg-base-200">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`group inline-flex h-full w-12 items-center justify-center rounded-l-full transition-colors duration-300 ease-in focus:outline-none ${
              viewMode === 'grid' ? 'bg-base-300' : ''
            }`}
            aria-label="Grid layout"
            title="Grid layout"
          >
            {viewMode === 'grid' && <CheckIcon className="mr-1 flex items-center text-base-content" />}
            <GridViewIcon className="h-4 w-4 fill-current text-base-content" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`group inline-flex h-full w-12 items-center justify-center rounded-r-full transition-colors duration-300 ease-in focus:outline-none ${
              viewMode === 'list' ? 'bg-base-300' : ''
            }`}
            aria-label="List layout"
            title="List layout"
          >
            {viewMode === 'list' && <CheckIcon className="mr-1 flex items-center text-base-content" />}
            <ListViewIcon className="h-4 w-4 fill-current text-base-content" />
          </button>
        </div>
      </div>

      <div className="flex justify-center p-4">
        <div className="w-full">
          {/*********** List View ***********/}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-base-200">
                  <tr>
                    <th className="hidden border-b border-base-300 px-2 py-1 text-left sm:table-cell">#</th>
                    <th className="border-b border-base-300 px-2 py-1 text-left">Name</th>
                    <th className="hidden border-b border-base-300 px-2 py-1 text-left sm:table-cell">Kind</th>
                    <th className="border-b border-base-300 px-2 py-1 text-left">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, fileIndex) => {
                    const isSelected = selectedIds.has(file.id)
                    const sizeValue = file.size ?? 0
                    const isFolder = file.kind === 'drive#folder'
                    function truncateFileName(name: string, maxLength: number, truncateAt: number): React.ReactNode {
                      if (name.length <= maxLength) return name
                      const truncated = name.slice(0, truncateAt) + '...' + name.slice(-truncateAt)
                      return truncated
                    }
                    return (
                      <tr
                        key={file.id}
                        onClick={() => toggleFile(file)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleFile(file)
                        }}
                        className={`cursor-pointer ${fileIndex % 2 === 0 ? 'bg-base-100' : 'bg-base-200'} ${isSelected ? 'bg-primary/40' : 'hover:bg-base-300'} `}
                        aria-pressed={isSelected}
                        aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
                      >
                        <td className="hidden border-b border-base-300 px-2 py-1 sm:table-cell">{fileIndex + 1}</td>

                        <td
                          className="whitespace-normal break-words border-b border-base-300 px-2 py-1 sm:whitespace-nowrap"
                          title={file.name}
                        >
                          {truncateFileName(file.name, 50, 45)}
                        </td>

                        <td className="hidden border-b border-base-300 px-2 py-1 sm:table-cell">
                          {isFolder ? 'Folder' : 'File'}
                        </td>

                        <td className="border-b border-base-300 px-2 py-1">{formatBytes(sizeValue)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/*********** Grid View ***********/}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {files.map((file) => {
                const isSelected = selectedIds.has(file.id)
                const sizeValue = file.size ?? 0
                const isFolder = file.kind === 'drive#folder'
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFile(file)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggleFile(file)
                    }}
                    className={
                      'group relative flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border p-3 focus:outline-none ' +
                      (isSelected ? 'border-primary bg-primary/20' : 'border-transparent hover:bg-base-100')
                    }
                    aria-pressed={isSelected}
                    aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
                  >
                    {file.iconLink && (
                      <img src={file.iconLink} alt={`${file.name} icon`} className="h-12 w-12 object-contain" />
                    )}
                    <span
                      className="block w-full max-w-full truncate text-center text-sm text-base-content"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span className="mt-1 text-xs text-base-content">{isFolder ? 'Folder' : 'File'}</span>
                    <span className="mt-1 hidden text-xs text-base-content md:block">{formatBytes(sizeValue)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
FilesTable.displayName = 'FilesTable'
