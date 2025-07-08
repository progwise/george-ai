import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { reprocessFiles } from './change-files'
import { aiLibraryUnprocessed } from './get-files'

interface ProcessUnprocessedDialogProps {
  libraryId: string
  disabled: boolean
  tableDataChanged: () => void
  unprocessedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
}

export const ProcessUnprocessedDialog = ({
  libraryId,
  setCheckedFileIds,
  tableDataChanged,
}: ProcessUnprocessedDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...processUnprocessedMutation } = useMutation({
    mutationFn: async (fileIds: string[]) => {
      dialogRef.current?.close()
      await reprocessFiles({ data: fileIds })
    },
    onSuccess: () => {
      toastSuccess(t('actions.processSuccess', { count: unprocessedFileCount }))
    },
    onError: () => {
      toastError(t('errors.processUnprocessed'))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
  })

  const textOfDropButton = t('actions.processUnprocessed')

  const {
    data: { aiLibraryUnprocessedFiles },
  } = useSuspenseQuery(aiLibraryUnprocessed({ libraryId }))
  const unprocessedFileIds = aiLibraryUnprocessedFiles.files.map((file) => file.id)
  const unprocessedFileCount = aiLibraryUnprocessedFiles.files.length

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-xs tooltip tooltip-bottom"
        data-tip={t('tooltips.processUnprocessed')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={unprocessedFileCount === 0}
      >
        {textOfDropButton}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.processUnprocessed')}
        description={t('texts.processUnprocessed')}
        onSubmit={() => processUnprocessedMutation.mutate(unprocessedFileIds)}
        submitButtonText={textOfDropButton}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">
              {t('texts.numberOfFilesToBeProcessed', { count: unprocessedFileCount })}
            </span>
          </div>
        </div>
      </DialogForm>
    </>
  )
}
