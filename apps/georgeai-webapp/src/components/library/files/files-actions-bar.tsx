import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArchiveIcon } from '../../../icons/archive-icon'
import { FileIcon } from '../../../icons/file-icon'
import { isGoogleDriveConfigured } from '../../data-sources/login-google-server'
import { useLibraryActions } from '../use-library-actions'
import { DropAllFilesDialog } from './drop-all-files-dialog'
import { FileUploadProgressDialog, PreparedUploadFile } from './file-upload-progress-dialog'
import { GoogleFileUploadButton } from './google-file-upload'

interface FilesActionsBarProps {
  hasLegacyData?: boolean
  libraryId: string
  totalItems: number
  showArchived: boolean
  archivedCount: number
}

export const FilesActionsBar = ({
  libraryId,
  totalItems,
  showArchived,
  archivedCount,
  hasLegacyData,
}: FilesActionsBarProps) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileUploadProgressDialogRef = useRef<HTMLDialogElement | null>(null)
  const [preparedUploadFiles, setPreparedUploadFiles] = useState<PreparedUploadFile[]>([])
  const navigate = useNavigate({ from: '/libraries/$libraryId/files' })
  const { prepareDesktopFileUploads, upgradeLibraryFromLegacy, isPending } = useLibraryActions(libraryId)

  const { data: googleDriveEnabled } = useQuery({
    queryKey: ['isGoogleDriveConfigured'],
    queryFn: () => isGoogleDriveConfigured(),
    staleTime: Infinity, // Config won't change at runtime
  })

  const handlePrepareUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (files.length === 0) return

    prepareDesktopFileUploads(
      files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified),
      })),
      {
        onError: () => {
          fileUploadProgressDialogRef.current?.close()
        },
        onSuccess: (filesWithId) => {
          const preparedFiles: PreparedUploadFile[] = files.map((file) => {
            const matchedFile = filesWithId.find((f) => f.fileName === file.name)
            if (!matchedFile) {
              throw new Error(`Prepared file not found for ${file.name}`)
            }
            return {
              fileId: matchedFile.fileId,
              fileName: matchedFile.fileName,
              uploadUrl: matchedFile.uploadUrl,
              headers: matchedFile.headers,
              blob: file,
            }
          })
          setPreparedUploadFiles(preparedFiles)
        },
      },
    )
  }

  const handleUpgradeFromLegacy = () => {
    upgradeLibraryFromLegacy()
  }

  return (
    <>
      <ul
        className={twMerge(
          'menu flex-nowrap items-end menu-xs rounded-box bg-base-200 shadow-lg md:menu-horizontal md:items-center',
        )}
      >
        {hasLegacyData && (
          <li>
            <button type="button" onClick={handleUpgradeFromLegacy} disabled={isPending || !hasLegacyData}>
              {t('libraries.upgradeFromLegacy')}
            </button>
          </li>
        )}
        <li className={twMerge(hasLegacyData && 'menu-disabled')}>
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click()
            }}
            disabled={isPending || hasLegacyData}
          >
            <FileIcon className="size-5" />
            {t('actions.upload')}
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handlePrepareUploadFiles}
            style={{ display: 'none' }}
            disabled={isPending || hasLegacyData}
          />
        </li>
        {googleDriveEnabled && (
          <li className={twMerge(hasLegacyData && 'menu-disabled')}>
            <GoogleFileUploadButton libraryId={libraryId} disabled={isPending || !!hasLegacyData} />
          </li>
        )}
        <li className={twMerge(hasLegacyData && 'menu-disabled')}>
          <DropAllFilesDialog libraryId={libraryId} disabled={isPending || !!hasLegacyData} totalItems={totalItems} />
        </li>
        <li className={twMerge(hasLegacyData && 'menu-disabled')}>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              disabled={isPending || hasLegacyData}
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={showArchived}
              onChange={(e) => navigate({ search: { showArchived: e.target.checked } })}
            />
            <ArchiveIcon className="size-4" />
            <span className="text-xs">{t('actions.showArchived', { count: archivedCount })}</span>
          </label>
        </li>
      </ul>
      {preparedUploadFiles.length > 0 && (
        <FileUploadProgressDialog
          libraryId={libraryId}
          preparedUploadFiles={preparedUploadFiles}
          onClose={() => setPreparedUploadFiles([])}
        />
      )}
    </>
  )
}
