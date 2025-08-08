import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getListQueryOptions } from '../../../../components/lists/get-list'
import { getListsQueryOptions } from '../../../../components/lists/get-lists'
import { ListDeleteButton } from '../../../../components/lists/list-delete-button'
import { ListSelector } from '../../../../components/lists/list-selector'
import { NewListButton } from '../../../../components/lists/new-list-button'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { EditIcon } from '../../../../icons/edit-icon'
import { ListViewIcon } from '../../../../icons/list-view-icon'
import { MenuIcon } from '../../../../icons/menu-icon'

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
    <div className="drawer lg:drawer-open min-h-[calc(100dvh_-_--spacing(16))]">
      <input id="lists-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <ul className="menu menu-xs bg-base-200 menu-horizontal rounded-box">
          <li>
            <label htmlFor="lists-drawer" className="drawer-button btn btn-sm lg:hidden">
              <MenuIcon className="size-6" />
              {t('lists.listSelector')}
            </label>
          </li>
          <li>
            <NewListButton variant="ghost" />
          </li>
          <li>
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
          <li>
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
          <li>
            <ListDeleteButton list={aiList} />
          </li>
        </ul>

        <Outlet />
      </div>
      <div className="drawer-side max-lg:z-50 lg:top-16">
        <label htmlFor="lists-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="bg-base-100 flex w-80 flex-col items-center bg-auto p-4 lg:p-0 lg:pl-4 lg:pt-4">
          <ListSelector lists={aiLists} />
        </div>
      </div>
    </div>
  )
}
