import React, { useCallback, useMemo } from 'react'
import { z } from 'zod'

import { FileIconLarge } from '../../icons/file-icon-large'

export const LibraryFileSchema = z.object({
  id: z.string(),
  kind: z.string(),
  name: z.string(),
})
export type LibraryFile = z.infer<typeof LibraryFileSchema>

export interface FilesTableProps {
  files: LibraryFile[]
  selectedFiles: LibraryFile[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<LibraryFile[]>>
}

export const FilesTable: React.FC<FilesTableProps> = React.memo(({ files, selectedFiles, setSelectedFiles }) => {
  const selectedIds = useMemo(() => new Set(selectedFiles.map((f) => f.id)), [selectedFiles])

  const toggle = useCallback(
    (file: LibraryFile) => {
      const isSelected = selectedIds.has(file.id)
      setSelectedFiles((prev) => (isSelected ? prev.filter((f) => f.id !== file.id) : [...prev, file]))
    },
    [selectedIds, setSelectedFiles],
  )

  return (
    <>
      {/* Mobile: List view */}
      <div className="flex flex-col gap-2 p-2 lg:hidden">
        {files.map((file, idx) => {
          const isSelected = selectedIds.has(file.id)
          return (
            <div
              key={file.id}
              onClick={() => toggle(file)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggle(file)
              }}
              className={
                'flex select-none items-center gap-3 rounded border p-2 focus:outline-none ' +
                (isSelected ? 'border-blue-500 bg-base-200' : 'border-transparent hover:bg-base-100')
              }
              aria-pressed={isSelected}
              aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
            >
              <FileIconLarge className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <div className="flex-1 break-words text-sm" title={file.name}>
                {idx + 1}. {file.name}
              </div>
              <input type="checkbox" className="checkbox checkbox-xs" checked={isSelected} readOnly />
            </div>
          )
        })}
      </div>

      {/* Desktop: Icon grid view */}
      <div
        className="hidden gap-4 p-4 lg:grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
      >
        {files.map((file) => {
          const isSelected = selectedIds.has(file.id)
          return (
            <div
              key={file.id}
              onClick={() => toggle(file)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggle(file)
              }}
              className={
                'flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border p-3 focus:outline-none ' +
                (isSelected ? 'border-blue-500 bg-base-200' : 'border-transparent hover:bg-base-100')
              }
              aria-pressed={isSelected}
              aria-label={`File ${file.name}, ${isSelected ? 'selected' : 'not selected'}`}
            >
              <FileIconLarge className="mb-2 h-10 w-10 text-gray-700 dark:text-gray-300" />
              <span className="block w-full break-words text-center text-sm" title={file.name}>
                {file.name}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
})
FilesTable.displayName = 'FilesTable'
