import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { LoadingSpinner } from '../../loading-spinner'
import { useLibraryActions } from '../use-library-actions'

interface DropFilesDialogProps {
  libraryId: string
  disabled: boolean
  tableDataChanged: () => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
}

export const DropFilesDialog = ({
  libraryId,
  checkedFileIds,
  setCheckedFileIds,
  tableDataChanged,
}: DropFilesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { deleteDocuments, isPending } = useLibraryActions(libraryId)

  const handleDeleteFiles = async (fileIds: string[]) => {
    deleteDocuments(fileIds, {
      onSettled: () => {
        setCheckedFileIds([])
        tableDataChanged()
        dialogRef.current?.close()
      },
    })
  }

  return (
    <>
      <button
        type="button"
        className="tooltip btn tooltip-bottom btn-xs btn-primary"
        data-tip={t('tooltips.dropDescription')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={checkedFileIds.length === 0 || isPending}
      >
        {t('actions.drop')}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropFilesDialog')}
        description={t('texts.dropFilesDialogDescription')}
        onSubmit={() => handleDeleteFiles(checkedFileIds)}
        submitButtonText={t('actions.drop')}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">{t('texts.numberOfFilesToBeDropped', { count: checkedFileIds.length })}</span>
          </div>
        </div>
      </DialogForm>
    </>
  )
}
