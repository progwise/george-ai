import { dateTimeString, formatBytes } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { FileIcon } from '../../icons/file-icon'
import { FolderIcon } from '../../icons/folder-icon'

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
  const { t, language } = useTranslation()

  if (viewMode === 'list') {
    return (
      <div className="overflow-x-auto">
        <table className="table-zebra table-sm table">
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
                  className={`hover:bg-base-200 cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
                  onClick={() => (isFolder ? onOpenFolder(file.id, file.name) : onToggleFile(file))}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={isSelected}
                      onChange={() => onToggleFile(file)}
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
                        className={`truncate ${isFolder ? 'text-primary font-medium' : ''}`}
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
                    {file.modifiedTime ? dateTimeString(file.modifiedTime, language) : '-'}
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 p-2">
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
                if (isFolder) {
                  onOpenFolder(file.id, file.name)
                } else {
                  onToggleFile(file)
                }
              }
            }}
            className={`card card-compact bg-base-100 border transition-all ${
              isSelected
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-base-300 hover:border-base-content/20 hover:shadow-sm'
            }`}
          >
            <div className="card-body items-center text-center">
              {/* Checkbox in top-left corner */}
              <div className="absolute left-2 top-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={isSelected}
                  onChange={() => onToggleFile(file)}
                  aria-label={`Select ${file.name}`}
                />
              </div>

              {/* Icon */}
              <div className="pt-4">
                {file.iconLink ? (
                  <img src={file.iconLink} alt="" className="h-10 w-10 object-contain" />
                ) : isFolder ? (
                  <FolderIcon className="h-10 w-10" />
                ) : (
                  <FileIcon className="h-10 w-10" />
                )}
              </div>

              {/* File name */}
              <p className="w-full truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>

              {/* Type and size */}
              <div className="flex flex-wrap justify-center gap-1">
                <span className="badge badge-ghost badge-xs">{isFolder ? t('labels.folder') : t('labels.file')}</span>
                {!isFolder && sizeValue > 0 && (
                  <span className="badge badge-ghost badge-xs">{formatBytes(sizeValue)}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
