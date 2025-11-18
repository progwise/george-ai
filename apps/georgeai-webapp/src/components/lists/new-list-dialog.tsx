import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { createListFn, getCreateListSchema } from './server-functions'

interface NewListDialogProps {
  ref: React.RefObject<HTMLDialogElement | null>
}

export const NewListDialog = ({ ref }: NewListDialogProps) => {
  const { t, language } = useTranslation()
  const navigate = useNavigate()

  const { mutate: createList, isPending: createListIsPending } = useMutation({
    mutationFn: (data: FormData) => createListFn({ data }),
    onError: (error) => toastError(t('lists.createError', { message: error.message })),
    onSuccess: (data) => {
      ref.current?.close()
      toastSuccess(t('lists.createSuccess'))
      navigate({ to: '/lists/$listId/edit', params: { listId: data.createList.id } })
    },
  })

  const schema = useMemo(() => getCreateListSchema(language), [language])

  return (
    <DialogForm
      ref={ref}
      title={t('lists.createDialogTitle')}
      description={t('lists.createDialogDescription')}
      onSubmit={createList}
      disabledSubmit={createListIsPending}
      submitButtonText={t('actions.create')}
      className="max-w-sm"
    >
      <Input
        name="name"
        schema={schema}
        label={t('lists.labelName')}
        placeholder={t('lists.placeholderName')}
        required={true}
      />
    </DialogForm>
  )
}
