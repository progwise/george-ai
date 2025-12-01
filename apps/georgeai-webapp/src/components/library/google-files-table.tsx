import { formatBytes } from '@george-ai/web-utils'

import { FileIcon } from '../../icons/file-icon'
import { FolderIcon } from '../../icons/folder-icon'

export interface GoogleDriveFile {
  id: string
  name: string
  size: number
  iconLink?: string
  mimeType: string
}

export interface GoogleFilesTableProps {
  files: GoogleDriveFile[]
  selectedIds: Set<string>
  viewMode: 'grid' | 'list'
  onToggleFile: (file: GoogleDriveFile) => void
  onOpenFolder: (id: string, name: string) => void
}

/**
 * Pure presentation component for rendering Google Drive files in grid or list view.
 * All state management and data fetching is handled by the parent component.
 */
export const GoogleFilesTable = ({
  files,
  selectedIds,
  viewMode,
  onToggleFile,
  onOpenFolder,
}: GoogleFilesTableProps) => {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2 p-2">
        {files.map((file) => {
          const isSelected = selectedIds.has(file.id)
          const sizeValue = file.size ?? 0
          const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
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
                onClick={() => onToggleFile(file)}
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
                onClick={isFolder ? () => onOpenFolder(file.id, file.name) : undefined}
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
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-2">
      {files.map((file) => {
        const isSelected = selectedIds.has(file.id)
        const sizeValue = file.size ?? 0
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder'

        return (
          <div
            key={file.id}
            onClick={isFolder ? () => onOpenFolder(file.id, file.name) : () => onToggleFile(file)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onToggleFile(file)
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
  )
}
