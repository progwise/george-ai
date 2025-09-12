import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getListQueryOptions } from '../../../../components/lists/get-list'
import { getListsQueryOptions } from '../../../../components/lists/get-lists'
import { ListDeleteButton } from '../../../../components/lists/list-delete-button'
import { ListExportButton } from '../../../../components/lists/list-export-button'
import { ListParticipants } from '../../../../components/lists/list-participants'
import { ListSelector } from '../../../../components/lists/list-selector'
import { NewListButton } from '../../../../components/lists/new-list-button'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { EditIcon } from '../../../../icons/edit-icon'
import { ListViewIcon } from '../../../../icons/list-view-icon'
import { getUsersQueryOptions } from '../../../../server-functions/users'

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
  const { data: usersData } = useSuspenseQuery(getUsersQueryOptions())
  const { user } = Route.useRouteContext()

  const {
    data: { aiLists },
  } = useSuspenseQuery(getListsQueryOptions())
  const {
    data: { aiList },
  } = useSuspenseQuery(getListQueryOptions(params.listId))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <ul className="bg-base-200 menu menu-horizontal rounded-box gap-2">
          <li className="">
            <NewListButton variant="ghost" />
          </li>
          <li className="">
            <ListSelector lists={aiLists} selectedListId={params.listId} />
          </li>
          <li className="">
            <Link
              to="/lists/$listId"
              className="btn btn-sm"
              params={{ listId: params.listId }}
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{ className: 'btn-active' }}
            >
              <ListViewIcon />
              {t('lists.view')}
            </Link>
          </li>
          <li className="">
            <Link
              to="/lists/$listId/edit"
              className="btn btn-sm"
              params={{ listId: params.listId }}
              activeOptions={{ exact: true }}
              activeProps={{ className: 'btn-active' }}
            >
              <EditIcon />
              {t('lists.edit')}
            </Link>
          </li>
          <li>
            <ListExportButton listId={params.listId} />
          </li>
        </ul>
        <ul className="bg-base-200 menu menu-horizontal rounded-box float-right">
          <li className="">
            <ListParticipants list={aiList} users={usersData.users} userId={user.id} />
          </li>
          {aiList.ownerId === user.id && (
            <li className="">
              <ListDeleteButton list={aiList} />
            </li>
          )}
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
