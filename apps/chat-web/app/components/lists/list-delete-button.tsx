import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { graphql } from '../../gql'
import { ListDeleteButton_ListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { toastError, toastSuccess } from '../georgeToaster'
import { deleteList } from './delete-list'
import { getListQueryOptions } from './get-list'
import { getListsQueryOptions } from './get-lists'

graphql(`
  fragment ListDeleteButton_List on AiList {
    id
    name
  }
`)

interface ListDeleteButtonProps {
  list: ListDeleteButton_ListFragment
}

export const ListDeleteButton = ({ list }: ListDeleteButtonProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()
  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteList({ data: list.id }),
    onSuccess: async () => {
      toastSuccess(t('lists.deleteSuccess', { name: list.name }))
      await Promise.all([
        queryClient.invalidateQueries(getListsQueryOptions()),
        queryClient.removeQueries(getListQueryOptions(list.id)),
      ])
      await navigate({ to: '/lists' })
    },
    onError: (error) => toastError(t('lists.deleteError', { message: error.message })),
  })

  const handleButtonClick = () => {
    dialogRef.current?.showModal()
  }

  const handleSubmit = () => {
    mutate()
  }
  return (
    <section className="m-0 inline-block p-0">
      <button type="button" className="btn btn-sm" onClick={handleButtonClick} disabled={isPending}>
        <TrashIcon className="size-6" />
      </button>

      <DialogForm ref={dialogRef} title={t('lists.deleteDialogTitle')} onSubmit={handleSubmit}>
        {t('lists.deleteDialogConfirmation', { name: list.name })}
      </DialogForm>
    </section>
  )
}
