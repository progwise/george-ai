import React, { useCallback, useMemo } from 'react'
import { z } from 'zod'

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

const FileSvgIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
    <g transform="translate(1.4066 1.4066) scale(2.81 2.81)">
      <path d="M 77.474 17.28 L 61.526 1.332 C 60.668 0.473 59.525 0 58.311 0 H 15.742 c -2.508 0 -4.548 2.04 -4.548 4.548 v 80.904 c 0 2.508 2.04 4.548 4.548 4.548 h 58.516 c 2.508 0 4.549 -2.04 4.549 -4.548 V 20.496 C 78.807 19.281 78.333 18.138 77.474 17.28 z" />
      <path d="M 61.073 5.121 l 12.611 12.612 H 62.35 c -0.704 0 -1.276 -0.573 -1.276 -1.277 V 5.121 z" />
      <path d="M 74.258 87 H 15.742 c -0.854 0 -1.548 -0.694 -1.548 -1.548 V 4.548 C 14.194 3.694 14.888 3 15.742 3 h 42.332 v 13.456 c 0 2.358 1.918 4.277 4.276 4.277 h 13.457 v 64.719 C 75.807 86.306 75.112 87 74.258 87 z" />
      <path d="M 68.193 33.319 H 41.808 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 26.385 c 0.828 0 1.5 0.671 1.5 1.5 S 69.021 33.319 68.193 33.319 z" />
      <path d="M 34.456 33.319 H 21.807 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 12.649 c 0.829 0 1.5 0.671 1.5 1.5 S 35.285 33.319 34.456 33.319 z" />
      <path d="M 42.298 20.733 H 21.807 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 20.492 c 0.829 0 1.5 0.671 1.5 1.5 S 43.127 20.733 42.298 20.733 z" />
      <path d="M 68.193 44.319 H 21.807 c -0.829 0 -1.5 -0.671 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 46.387 c 0.828 0 1.5 0.671 1.5 1.5 S 69.021 44.319 68.193 44.319 z" />
      <path d="M 48.191 55.319 H 21.807 c -0.829 0 -1.5 -0.672 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 26.385 c 0.828 0 1.5 0.672 1.5 1.5 S 49.02 55.319 48.191 55.319 z" />
      <path d="M 68.193 55.319 H 55.544 c -0.828 0 -1.5 -0.672 -1.5 -1.5 s 0.672 -1.5 1.5 -1.5 h 12.649 c 0.828 0 1.5 0.672 1.5 1.5 S 69.021 55.319 68.193 55.319 z" />
      <path d="M 68.193 66.319 H 21.807 c -0.829 0 -1.5 -0.672 -1.5 -1.5 s 0.671 -1.5 1.5 -1.5 h 46.387 c 0.828 0 1.5 0.672 1.5 1.5 S 69.021 66.319 68.193 66.319 z" />
      <path d="M 68.193 77.319 H 55.544 c -0.828 0 -1.5 -0.672 -1.5 -1.5 s 0.672 -1.5 1.5 -1.5 h 12.649 c 0.828 0 1.5 0.672 1.5 1.5 S 69.021 77.319 68.193 77.319 z" />
    </g>
  </svg>
)

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
              <FileSvgIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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
              <FileSvgIcon className="mb-2 h-10 w-10 text-gray-700 dark:text-gray-300" />
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
