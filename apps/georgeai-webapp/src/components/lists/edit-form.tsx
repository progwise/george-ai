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
    <form ref={formRef} className="">
      <LoadingSpinner isLoading={isPending} />
      <input type="hidden" name="id" value={list.id} />
      <div className="card bg-base-100 grid grid-cols-2 gap-2 p-2 shadow-md">
        <Input {...fieldProps} label={t('lists.labelName')} name="name" value={list.name} required />
        <div className="grid grid-cols-2 gap-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t('lists.labelCreatedAt')}</span>
            </label>
            <ClientDate
              date={list.createdAt}
              format="dateTime"
              className="input input-bordered input-disabled w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">{t('lists.labelUpdatedAt')}</span>
            </label>
            <ClientDate
              date={list.updatedAt}
              format="dateTime"
              className="input input-bordered input-disabled w-full"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
