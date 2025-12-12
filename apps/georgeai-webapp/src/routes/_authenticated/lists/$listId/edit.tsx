import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { ListEditForm } from '../../../../components/lists/edit-form'
import { ListSourcesManager } from '../../../../components/lists/list-sources-manager'
import { getListQueryOptions } from '../../../../components/lists/queries'

export const Route = createFileRoute('/_authenticated/lists/$listId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { listId } = Route.useParams()
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(listId))
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <ListEditForm list={aiList} />
      <ListSourcesManager list={aiList} />
    </div>
  )
}
