import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { ListMenu } from '../../../../components/lists/list-menu'
import { getListQueryOptions, getListsQueryOptions } from '../../../../components/lists/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { EditIcon } from '../../../../icons/edit-icon'
import { ListViewIcon } from '../../../../icons/list-view-icon'
import { StatisticsIcon } from '../../../../icons/statistics-icon'

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
    <div className="flex flex-col gap-4">
      <ListMenu list={aiList} selectableLists={aiLists} />

      <div role="tablist" className="tabs tabs-lift justify-end">
        <Link
          to="/lists/$listId"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <ListViewIcon />
          {t('lists.view')}
        </Link>
        <Link
          to="/lists/$listId/enrichments"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true, includeSearch: false }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <EditIcon />
          {t('lists.enrichments')}
        </Link>
        <Link
          to="/lists/$listId/statistics"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <StatisticsIcon />
          {t('lists.statistics')}
        </Link>
        <Link
          to="/lists/$listId/edit"
          className="tab"
          params={{ listId: params.listId }}
          activeOptions={{ exact: true }}
          activeProps={{ className: 'tab-active' }}
          role="tab"
        >
          <EditIcon />
          {t('lists.edit')}
        </Link>
        <input type="radio" className="tab hidden" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 border p-3">
          <div className="relative overflow-scroll">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
