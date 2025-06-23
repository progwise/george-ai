import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropFiles } from './change-files'

interface DropFileConfirmationDialogProps {
  disabled: boolean
  tableDataChanged: () => void
  selectedFileIds: string[]
  setSelectedFileIds: (fileIds: string[]) => void
}

export const DropFileConfirmationDialog = ({
  selectedFileIds,
  setSelectedFileIds,
  tableDataChanged,
}: DropFileConfirmationDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...dropFilesMutation } = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropFiles({ data: fileIds })
    },
    onSuccess: () => {
      toastError(t('errors.dropFilesError'))
    },
    onError: () => {
      toastSuccess(`${selectedFileIds.length} ${t('actions.dropSuccess')}`)
    },
    onSettled: () => {
      setSelectedFileIds([])
      tableDataChanged()
    },
  })

  const title = t('libraries.dropFileConfirmationDialog')
  const description = t('texts.dropFileConfirmationDescription')
  const submitButtonText = t('actions.drop')

  dialogRef.current?.close()

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary tooltip tooltip-bottom"
        data-tip={t('tooltips.dropDescription')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={selectedFileIds.length === 0}
      >
        <span className="hidden sm:inline">{t('actions.drop')}</span>
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={() => dropFilesMutation.mutate(selectedFileIds)}
        submitButtonText={submitButtonText}
      >
        <div className="w-full">
          <div className="mb-4">
            <>
              {selectedFileIds.length} {t('texts.numberOfFilesSelected')} <span className="font-medium"></span>
            </>
          </div>
        </div>
      </DialogForm>
    </>
  )
}
