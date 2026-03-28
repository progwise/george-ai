import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { TrashIcon } from '../../../icons/trash-icon'
import { DialogForm } from '../../dialog-form'
import { LoadingSpinner } from '../../loading-spinner'
import { useLibraryActions } from '../use-library-actions'

interface DropAllFilesDialogProps {
  libraryId: string
  disabled: boolean
  totalItems: number
}

export const DropAllFilesDialog = ({ libraryId, totalItems }: DropAllFilesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { dropAllDocuments, isPending } = useLibraryActions(libraryId)

  const textOfDropButton = t('actions.dropAllFiles')

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} disabled={totalItems === 0}>
        <TrashIcon className="size-5" />
        {textOfDropButton}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropAllFilesDialog')}
        description={t('texts.dropAllFilesDialogDescription')}
        onSubmit={() => {
          dropAllDocuments(libraryId)
        }}
        submitButtonText={textOfDropButton}
      >
        <div className="w-full">
          <div className="mb-4">
            <>
              <span className="font-medium">{t('texts.numberOfFilesToBeDropped', { count: totalItems })}</span>
            </>
          </div>
        </div>
      </DialogForm>
    </>
  )
}
