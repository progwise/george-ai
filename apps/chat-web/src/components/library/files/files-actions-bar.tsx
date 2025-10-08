import { useMutation } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArchiveIcon } from '../../../icons/archive-icon'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { createContentProcessingTasksFn, createEmbeddingTasksFn } from '../server-functions/processing'
import { DesktopFileUpload } from './desktop-file-upload'
import { DropAllFilesDialog } from './drop-all-files-dialog'
import { DropFilesDialog } from './drop-files-dialog'
import { GoogleFileUploadButton } from './google-file-upload'

interface FilesActionsBarProps {
  libraryId: string
  usedStorage: number
  availableStorage: number
  tableDataChanged: () => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
  totalItems: number
  showArchived: boolean
  onShowArchivedChange: (show: boolean) => void
  archivedCount: number
}

export const FilesActionsBar = ({
  libraryId,
  usedStorage,
  availableStorage,
  tableDataChanged,
  checkedFileIds,
  setCheckedFileIds,
  totalItems,
  showArchived,
  onShowArchivedChange,
  archivedCount,
}: FilesActionsBarProps) => {
  const { t } = useTranslation()

  const { mutate: reEmbedFilesMutate, isPending: reEmbedFilesPending } = useMutation({
    mutationFn: async (fileIds: string[]) => await createEmbeddingTasksFn({ data: { fileIds } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.createEmbeddingTasks', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.createEmbeddingTasksSuccess', { count: data.length }))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
  })

  const { mutate: reprocessFilesMutate, isPending: reprocessFilesPending } = useMutation({
    mutationFn: async (fileIds: string[]) => await createContentProcessingTasksFn({ data: { fileIds } }),
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('errors.createExtractionTasks', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      toastSuccess(t('actions.createExtractionTasksSuccess', { count: data.length }))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
  })
  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    reprocessFilesMutate(uploadedFileIds)
  }

  const remainingStorage = availableStorage - usedStorage
  return (
    <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <LoadingSpinner isLoading={reprocessFilesPending || reEmbedFilesPending} />
      <div className="flex flex-wrap items-center gap-2">
        <DesktopFileUpload
          libraryId={libraryId}
          onUploadComplete={handleUploadComplete}
          disabled={remainingStorage < 1}
        />
        <GoogleFileUploadButton libraryId={libraryId} disabled={remainingStorage < 1} />

        <DropFilesDialog
          disabled={false}
          tableDataChanged={tableDataChanged}
          checkedFileIds={checkedFileIds}
          setCheckedFileIds={setCheckedFileIds}
        />

        <DropAllFilesDialog
          libraryId={libraryId}
          disabled={false}
          setCheckedFileIds={setCheckedFileIds}
          tableDataChanged={tableDataChanged}
          totalItems={totalItems}
        />

        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => reEmbedFilesMutate(checkedFileIds)}
          disabled={checkedFileIds.length === 0}
        >
          {t('actions.reembed')}
        </button>

        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => reprocessFilesMutate(checkedFileIds)}
          disabled={checkedFileIds.length === 0}
        >
          {t('actions.reprocess')}
        </button>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={showArchived}
            onChange={(e) => onShowArchivedChange(e.target.checked)}
          />
          <span
            className={`flex items-center gap-1 text-sm ${showArchived ? 'text-base-content' : 'text-base-content/60'}`}
          >
            <ArchiveIcon className="h-4 w-4" />
            {t('actions.showArchived', { count: archivedCount })}
          </span>
        </label>
      </div>
      <div className="text-right text-sm">
        <div className="font-semibold">{t('labels.remainingStorage')}</div>
        <div>
          {availableStorage - usedStorage} / {usedStorage} MB
        </div>
      </div>
    </nav>
  )
}
