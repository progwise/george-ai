import { formatBytes } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { FileIcon } from '../../icons/file-icon'
import { FolderIcon } from '../../icons/folder-icon'
import { ClientDate } from '../client-date'

export interface GoogleDriveFile {
  id: string
  name: string
  size: number
  iconLink?: string
  mimeType: string
  modifiedTime?: string
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
  const { t } = useTranslation()

  if (viewMode === 'list') {
    return (
      <div className="overflow-x-auto">
        <table className="table table-zebra table-sm">
          <thead>
            <tr>
              <th className="w-10"></th>
              <th>{t('labels.name')}</th>
              <th className="hidden sm:table-cell">{t('labels.type')}</th>
              <th className="hidden md:table-cell">{t('labels.size')}</th>
              <th className="hidden lg:table-cell">{t('labels.modified')}</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const isSelected = selectedIds.has(file.id)
              const sizeValue = file.size ?? 0
              const isFolder = file.mimeType === 'application/vnd.google-apps.folder'
              const iconClass = 'h-5 w-5 flex-shrink-0'

              return (
                <tr
                  key={file.id}
                  className={`cursor-pointer hover:bg-base-200 ${isSelected ? 'bg-primary/10' : ''}`}
                  onClick={() => (isFolder ? onOpenFolder(file.id, file.name) : onToggleFile(file))}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={isSelected}
                      onChange={() => onToggleFile(file)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${file.name}`}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {file.iconLink ? (
                        <img src={file.iconLink} alt="" className={`${iconClass} object-contain`} />
                      ) : isFolder ? (
                        <FolderIcon className={iconClass} />
                      ) : (
                        <FileIcon className={iconClass} />
                      )}
                      <span
                        className={`truncate ${isFolder ? 'font-medium text-primary' : ''}`}
                        title={file.name}
                        style={{ maxWidth: '300px' }}
                      >
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="badge badge-ghost badge-sm">
                      {isFolder ? t('labels.folder') : t('labels.file')}
                    </span>
                  </td>
                  <td className="hidden text-nowrap md:table-cell">{isFolder ? '-' : formatBytes(sizeValue)}</td>
                  <td className="hidden text-nowrap lg:table-cell">
                    <ClientDate date={file.modifiedTime} format="dateTime" fallback="-" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 p-2">
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
              if (event.key === 'Enter' || event.key === ' ') {
                // Prevent Space key from scrolling the page
                event.preventDefault()
                if (isFolder) {
                  onOpenFolder(file.id, file.name)
                } else {
                  onToggleFile(file)
                }
              }
            }}
            className={`relative rounded-lg border p-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-base-300 hover:border-base-content/20 hover:bg-base-100'
            }`}
          >
            {/* Checkbox in top-left corner */}
            <div className="absolute top-1 left-1">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={isSelected}
                onChange={() => onToggleFile(file)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${file.name}`}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col items-center pt-3">
              {/* Icon */}
              {file.iconLink ? (
                <img src={file.iconLink} alt="" className="size-8 object-contain" />
              ) : isFolder ? (
                <FolderIcon className="size-8" />
              ) : (
                <FileIcon className="size-8" />
              )}

              {/* File name */}
              <div className="tooltip tooltip-bottom w-full" data-tip={file.name}>
                <p className={`mt-1 w-full truncate text-center text-xs ${isFolder ? 'font-medium text-primary' : ''}`}>
                  {file.name}
                </p>
              </div>

              {/* Size and date - only for files */}
              {!isFolder && (
                <div className="mt-0.5 text-center text-[10px] text-base-content/50">
                  {sizeValue > 0 && <span>{formatBytes(sizeValue)}</span>}
                  {sizeValue > 0 && file.modifiedTime && <span> · </span>}
                  {file.modifiedTime && <ClientDate date={file.modifiedTime} format="dateTime" />}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
