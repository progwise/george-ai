import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { createNewLibraryFn } from './server-functions/new-library'

export const NewLibraryDialog = ({ ref }: { ref: React.RefObject<HTMLDialogElement | null> }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => createNewLibraryFn({ data }),
    onSuccess: () => {
      toastSuccess(t('libraries.toastCreateSuccess'))
      ref.current?.close()
    },
    onError: (error: Error) => {
      toastError(`${t('libraries.toastCreateError')}: ${error.message}`)
    },
    onSettled: (result) => {
      const newId = result?.createLibrary?.id
      if (!newId) {
        throw new Error('Failed to create library')
      }
      navigate({ to: `/libraries/${newId}/settings` })
    },
  })

  return (
    <DialogForm
      ref={ref}
      title={t('libraries.addNew')}
      description={t('libraries.addNewDescription')}
      onSubmit={mutate}
      disabledSubmit={isPending}
      submitButtonText={t('libraries.addNewButton')}
    >
      <div className="flex w-full flex-col gap-4">
        <Input
          name="name"
          type="text"
          label={t('libraries.labelName')}
          placeholder={t('libraries.placeholders.name')}
          required
        />
        <Input
          name="description"
          type="textarea"
          label={t('labels.description')}
          placeholder={t('libraries.placeholders.description')}
          className="min-h-32"
        />
      </div>
    </DialogForm>
  )
}
