import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getListsQueryOptions } from '../../../components/lists/get-lists'
import { NewListButton } from '../../../components/lists/new-list-button'
import { useTranslation } from '../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/lists/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { t } = useTranslation()

  const [listsQuery] = useSuspenseQueries({
    queries: [getListsQueryOptions()],
  })
  const latestList = listsQuery.data.aiLists.at(0)

  useEffect(() => {
    if (latestList) {
      navigate({
        to: '/lists/$listId',
        params: { listId: latestList.id },
      })
    }
  }, [latestList, navigate])

  return (
    <div className="absolute flex h-screen w-full">
      <div className="prose mx-auto mt-8">
        <p>{t('lists.firstList')}</p>
        <NewListButton variant="primary" />
      </div>
    </div>
  )
}
