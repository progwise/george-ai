import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../i18n/use-translation-hook'
import { ListPlusIcon } from '../../icons/list-plus-icon'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { createList, getCreateListSchema } from './create-list'

interface NewListButtonProps {
  className?: string
  showText?: boolean
  variant?: 'default' | 'ghost' | 'primary'
}

export const NewListButton = ({ className, showText = true, variant = 'ghost' }: NewListButtonProps) => {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const buttonClasses = {
    default: 'btn btn-sm',
    ghost: 'btn btn-ghost btn-sm',
    primary: 'btn btn-primary btn-sm',
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => createList({ data }),
    onError: (error) => toastError(t('lists.createError', { message: error.message })),
    onSuccess: (data) => {
      toastSuccess(t('lists.createSuccess'))
      navigate({ to: '/lists/$listId/edit', params: { listId: data.createList.id } })
    },
  })

  const handleSubmit = async (data: FormData) => {
    mutate(data)
  }

  const schema = useMemo(() => getCreateListSchema(language), [language])

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={twMerge(buttonClasses[variant], className)}
        title={t('lists.newList')}
      >
        <ListPlusIcon className="size-6" />
        {showText && <span>{t('lists.newList')}</span>}
      </button>
      <DialogForm
        ref={dialogRef}
        title={t('lists.createDialogTitle')}
        description={t('lists.createDialogDescription')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('lists.createListButtonText')}
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
    </>
  )
}
