import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef } from 'react'

import { graphql } from '../../gql'
import { ListEditForm_ListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClientDate } from '../client-date'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { getListsQueryOptions } from './queries'
import { getUpdateListSchema, updateList } from './server-functions'

graphql(`
  fragment ListEditForm_List on AiList {
    id
    name
    ownerId
    createdAt
    updatedAt
  }
`)

interface ListEditFormProps {
  list: ListEditForm_ListFragment
}

export const ListEditForm = ({ list }: ListEditFormProps) => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => updateList({ data: formData }),
    onError: (error) => toastError(t('lists.updateError', { message: error.message })),
    onSuccess: async () => {
      toastSuccess(t('lists.updateSuccess'))
      await Promise.all([queryClient.invalidateQueries(getListsQueryOptions())])
    },
  })
  const schema = useMemo(() => getUpdateListSchema(language), [language])
  const fieldProps = {
    schema,
    onBlur: () => {
      if (!formRef.current) {
        return
      }
      const formData = new FormData(formRef.current)
      mutate(formData)
    },
  }
  return (
    <form ref={formRef} className="flex flex-col gap-2">
      <LoadingSpinner isLoading={isPending} />
      <input type="hidden" name="id" value={list.id} />

      {/* Settings Section */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-wide text-base-content/60 uppercase">{t('lists.edit')}</h3>

        <Input {...fieldProps} label={t('lists.labelName')} name="name" value={list.name} required />

        {/* Metadata Row */}
        <div className="mt-4 flex gap-6 border-t border-base-300 pt-3 text-xs text-base-content/60">
          <div>
            <span className="font-medium">{t('lists.labelCreatedAt')}:</span>{' '}
            <ClientDate date={list.createdAt} format="dateTime" />
          </div>
          <div>
            <span className="font-medium">{t('lists.labelUpdatedAt')}:</span>{' '}
            <ClientDate date={list.updatedAt} format="dateTime" />
          </div>
        </div>
      </div>
    </form>
  )
}
