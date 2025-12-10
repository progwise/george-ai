import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRef } from 'react'

import { NewListDialog } from '../../../components/lists/new-list-dialog'
import { getListsQueryOptions } from '../../../components/lists/queries'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ListPlusIcon } from '../../../icons/list-plus-icon'

export const Route = createFileRoute('/_authenticated/lists/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { aiLists } = await context.queryClient.ensureQueryData(getListsQueryOptions())
    const latestList = aiLists.at(0)

    if (latestList) {
      throw redirect({
        to: '/lists/$listId',
        params: { listId: latestList.id },
      })
    }
  },
})

function RouteComponent() {
  const newListDialogRef = useRef<HTMLDialogElement | null>(null)
  const { t } = useTranslation()

  return (
    <div className="absolute flex h-screen w-full">
      <div className="prose mx-auto mt-8">
        <p>{t('lists.firstList')}</p>
        <button
          type="button"
          onClick={() => newListDialogRef.current?.showModal()}
          className="btn btn-sm"
          title={t('lists.newList')}
        >
          <ListPlusIcon className="size-6" />
          <span>{t('lists.newList')}</span>
        </button>
        <NewListDialog ref={newListDialogRef} />
      </div>
    </div>
  )
}
