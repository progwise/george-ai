import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArchiveIcon } from '../../../icons/archive-icon'
import { FileIcon } from '../../../icons/file-icon'
import { toastError } from '../../georgeToaster'
import { DropAllFilesDialog } from './drop-all-files-dialog'
import { FileUploadProgressDialog, PreparedUploadFile } from './file-upload-progess-dialog'
import { GoogleFileUploadButton } from './google-file-upload'
import { useFileActions } from './use-file-actions'

interface FilesActionsBarProps {
  libraryId: string
  totalItems: number
  showArchived: boolean
  archivedCount: number
}

export const FilesActionsBar = ({ libraryId, totalItems, showArchived, archivedCount }: FilesActionsBarProps) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileUploadProgressDialogRef = useRef<HTMLDialogElement | null>(null)
  const [preparedUploadFiles, setPreparedUploadFiles] = useState<PreparedUploadFile[]>([])
  const navigate = useNavigate({ from: '/libraries/$libraryId/files' })
  const { prepareDesktopFileUploads, fileActionPending } = useFileActions({ libraryId })

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
        onError: (error) => {
          console.error('Error preparing files:', error)
          toastError(error instanceof Error ? error.message : 'Failed to prepare files for upload')
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

  return (
    <>
      <ul className="menu menu-xs md:menu-horizontal bg-base-200 rounded-box flex-nowrap items-end shadow-lg md:items-center">
        <li>
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click()
            }}
            disabled={fileActionPending}
          >
            <FileIcon className="h-5 w-5" />
            {t('actions.upload')}
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handlePrepareUploadFiles}
            style={{ display: 'none' }}
            disabled={fileActionPending}
          />
        </li>
        <li>
          <GoogleFileUploadButton libraryId={libraryId} disabled={false} />
        </li>
        <li>
          <DropAllFilesDialog libraryId={libraryId} disabled={false} totalItems={totalItems} />
        </li>
        <li>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={showArchived}
              onChange={(e) => navigate({ search: { showArchived: e.target.checked } })}
            />
            <ArchiveIcon className="h-4 w-4" />
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
