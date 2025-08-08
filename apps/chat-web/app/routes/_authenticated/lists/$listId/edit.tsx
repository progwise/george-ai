import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { ListEditForm } from '../../../../components/lists/edit-form'
import { ListSourcesManager } from '../../../../components/lists/list-sources-manager'
import { getListQueryOptions } from '../../../../components/lists/get-list'

export const Route = createFileRoute('/_authenticated/lists/$listId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))
  return (
    <div className="space-y-6">
      <ListEditForm list={aiList} />
      <ListSourcesManager list={aiList} />
    </div>
  )
}
