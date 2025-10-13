import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'

import { NewListDialog } from '../../../components/lists/new-list-dialog'
import { getListsQueryOptions } from '../../../components/lists/queries'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ListPlusIcon } from '../../../icons/list-plus-icon'

export const Route = createFileRoute('/_authenticated/lists/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(getListsQueryOptions())
  },
})

function RouteComponent() {
  const newListDialogRef = useRef<HTMLDialogElement | null>(null)

  const navigate = Route.useNavigate()
  const { t } = useTranslation()

  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())
  const latestList = useMemo(() => aiLists.at(0), [aiLists])

  if (latestList) {
    navigate({
      to: '/lists/$listId',
      params: { listId: latestList.id },
    })
    return null
  }

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
