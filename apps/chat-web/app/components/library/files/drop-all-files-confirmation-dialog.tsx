import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropFiles } from './change-files'

interface DropAllFilesConfirmationDialogProps {
  disabled: boolean
  tableDataChanged: () => void
  selectedFileIds: string[]
  setSelectedFileIds: (fileIds: string[]) => void
  allFileIds: string[]
}

export const DropAllFilesConfirmationDialog = ({
  selectedFileIds,
  setSelectedFileIds,
  tableDataChanged,
  allFileIds,
}: DropAllFilesConfirmationDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...dropAllFilesMutation } = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropFiles({ data: fileIds })
    },
    onError: () => {
      toastError(t('errors.dropAllFilesError'))
    },
    onSuccess: () => {
      toastSuccess(`${selectedFileIds.length} ${t('actions.dropSuccess')}`)
    },
    onSettled: () => {
      dialogRef.current?.close()
      setSelectedFileIds([])
      tableDataChanged()
    },
  })

  const submitButtonText = t('actions.dropAll')

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary tooltip tooltip-bottom"
        data-tip={t('tooltips.dropAllDescription')}
        onClick={() => dialogRef.current?.showModal()}
      >
        {t('actions.dropAll')}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropAllFileConfirmationDialog')}
        description={t('texts.dropAllFileConfirmationDescription')}
        onSubmit={() => dropAllFilesMutation.mutate(allFileIds)}
        submitButtonText={submitButtonText}
      >
        <div className="w-full">
          <div className="mb-4">
            <>
              {allFileIds.length} {t('texts.numberOfFilesSelected')}
            </>
          </div>
        </div>
      </DialogForm>
    </>
  )
}
