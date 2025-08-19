import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getListQueryOptions } from '../../../../components/lists/get-list'
import { getListsQueryOptions } from '../../../../components/lists/get-lists'
import { ListDeleteButton } from '../../../../components/lists/list-delete-button'
import { ListExportButton } from '../../../../components/lists/list-export-button'
import { ListSelector } from '../../../../components/lists/list-selector'
import { NewListButton } from '../../../../components/lists/new-list-button'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { EditIcon } from '../../../../icons/edit-icon'
import { ListViewIcon } from '../../../../icons/list-view-icon'

export const Route = createFileRoute('/_authenticated/lists/$listId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getListsQueryOptions()),
      context.queryClient.ensureQueryData(getListQueryOptions(params.listId)),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()
  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(params.listId))

  return (
    <div className="">
      <ul className="bg-base-200 menu-horizontal rounded-box flex w-full justify-start gap-2 p-2">
        <li className="">
          <NewListButton variant="ghost" />
        </li>
        <li className="w-60 items-center">
          <ListSelector lists={aiLists} selectedListId={params.listId} />
        </li>
        <li className="">
          <Link
            to="/lists/$listId"
            className="btn btn-sm"
            activeProps={{ className: 'btn-active' }}
            params={{ listId: params.listId }}
            activeOptions={{ exact: true, includeSearch: false }}
          >
            <ListViewIcon className="size-6" />
            {t('lists.view')}
          </Link>
        </li>
        <li className="">
          <Link
            to="/lists/$listId/edit"
            className="btn btn-sm"
            activeProps={{ className: 'btn-active' }}
            params={{ listId: params.listId }}
            activeOptions={{ exact: true }}
          >
            <EditIcon className="size-6" />
            {t('lists.edit')}
          </Link>
        </li>
        <li className="">
          <ListExportButton listId={params.listId} />
        </li>
        <li className="grow-1"></li>
        <li className="justify-self-end">
          <ListDeleteButton list={aiList} />
        </li>
      </ul>

      <Outlet />
    </div>
  )
}
