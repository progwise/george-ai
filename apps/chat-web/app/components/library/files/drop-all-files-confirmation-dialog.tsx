// BRANCH IN PROGRESS
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropFiles } from './change-files'
import { FilesTable } from './files-table'
import { aiLibraryFilesQueryOptions } from './get-files'

interface DropAllFilesConfirmationDialogProps {
  disabled: boolean
  tableDataChanged: () => void
  selectedFileIds: string[]
  setSelectedFileIds: (fileIds: string[]) => void
}

export const DropAllFilesConfirmationDialog = ({
  selectedFileIds,
  setSelectedFileIds,
  tableDataChanged,
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
      setSelectedFileIds([])
      tableDataChanged()
    },
  })

  const title = t('libraries.dropAllFileConfirmationDialog')
  const description = t('texts.dropAllFileConfirmationDescription')
  const submitButtonText = t('actions.dropAll')

  dialogRef.current?.close()

  const {
    data: { aiLibraryFiles },
  } = useSuspenseQuery(aiLibraryFilesQueryOptions({ libraryId, skip, take }))

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary tooltip tooltip-bottom"
        data-tip={t('tooltips.dropAllDescription')}
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className="hidden sm:inline">{t('actions.dropAll')}</span>
      </button>

      <LoadingSpinner isLoading={isPending} />

      <FilesTable
        firstItemNumber={skip + 1}
        files={aiLibraryFiles.files}
        selectedFileIds={selectedFileIds}
        setSelectedFileIds={setSelectedFileIds}
        tableDataChanged={() => {}}
      />

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={() => dropAllFilesMutation.mutate(selectedFileIds)}
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
